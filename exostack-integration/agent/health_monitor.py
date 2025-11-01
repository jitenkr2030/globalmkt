"""
Enhanced Agent Health Monitoring System with GPU support and real-time metrics
"""

import psutil
import time
import logging
import torch
import platform
import numpy as np
import subprocess
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from dataclasses import dataclass
from threading import Thread, Lock
from queue import Queue
import GPUtil

try:
    import pynvml
    pynvml.nvmlInit()
    PYNVML_AVAILABLE = True
except ImportError:
    pynvml = None
    PYNVML_AVAILABLE = False
    logging.warning("pynvml not available, advanced GPU monitoring disabled")

logger = logging.getLogger(__name__)

@dataclass
class MetricSample:
    timestamp: float
    value: float
    metric_type: str

class MetricsBuffer:
    def __init__(self, max_samples: int = 100):
        self.max_samples = max_samples
        self.samples: Dict[str, List[MetricSample]] = {}
        self.lock = Lock()

    def add_sample(self, metric_type: str, value: float):
        with self.lock:
            if metric_type not in self.samples:
                self.samples[metric_type] = []
            
            self.samples[metric_type].append(
                MetricSample(
                    timestamp=time.time(),
                    value=value,
                    metric_type=metric_type
                )
            )
            
            # Keep only recent samples
            if len(self.samples[metric_type]) > self.max_samples:
                self.samples[metric_type] = self.samples[metric_type][-self.max_samples:]

    def get_metrics(self, metric_type: str) -> List[MetricSample]:
        with self.lock:
            return self.samples.get(metric_type, [])

class HealthMonitor:
    def __init__(self, collection_interval: float = 1.0):
        self.start_time = time.time()
        self.collection_interval = collection_interval
        self.metrics_buffer = MetricsBuffer()
        self.task_history: List[Dict] = []
        self.max_history = 1000
        self.is_collecting = False
        self.collection_thread: Optional[Thread] = None
        self.gpu_enabled = torch.cuda.is_available()
        
        # Initialize GPU monitoring if available
        self.gpus = []
        if self.gpu_enabled:
            try:
                self.gpus = GPUtil.getGPUs()
                logger.info(f"Initialized GPU monitoring for {len(self.gpus)} GPUs")
            except Exception as e:
                logger.warning(f"Failed to initialize GPU monitoring: {e}")

    def start_collection(self):
        """Start the metrics collection thread"""
        if not self.is_collecting:
            self.is_collecting = True
            self.collection_thread = Thread(target=self._collect_metrics, daemon=True)
            self.collection_thread.start()
            logger.info("Started health metrics collection")

    def stop_collection(self):
        """Stop the metrics collection thread"""
        self.is_collecting = False
        if self.collection_thread:
            self.collection_thread.join()
            logger.info("Stopped health metrics collection")

    def _collect_metrics(self):
        """Continuously collect metrics at the specified interval"""
        while self.is_collecting:
            try:
                # Collect CPU metrics
                cpu_percent = psutil.cpu_percent(interval=None)
                self.metrics_buffer.add_sample("cpu_usage", cpu_percent)

                # Collect memory metrics
                memory = psutil.virtual_memory()
                self.metrics_buffer.add_sample("memory_usage", memory.percent)
                self.metrics_buffer.add_sample("memory_available", memory.available / 1024 / 1024)  # MB

                # Collect GPU metrics if available
                if self.gpu_enabled:
                    for gpu_id, gpu in enumerate(self.gpus):
                        try:
                            gpu.load = GPUtil.getGPUs()[gpu_id].load * 100
                            gpu.memoryUtil = GPUtil.getGPUs()[gpu_id].memoryUtil * 100
                            self.metrics_buffer.add_sample(f"gpu_{gpu_id}_usage", gpu.load)
                            self.metrics_buffer.add_sample(f"gpu_{gpu_id}_memory", gpu.memoryUtil)
                        except Exception as e:
                            logger.warning(f"Failed to collect GPU metrics: {e}")

                # Add more metrics as needed

            except Exception as e:
                logger.error(f"Error collecting metrics: {e}")

    def get_detailed_health(self) -> Dict[str, Any]:
        return {
            "timestamp": datetime.now().isoformat(),
            "uptime_seconds": time.time() - self.start_time,
            "system": self._get_system_info(),
            "resources": self._get_resource_usage(),
            "gpu": self.get_detailed_gpu_info(),
            "tasks": self._get_task_stats(),
            "status": self._get_overall_status(),
            "capabilities": {
                "gpu_capable": self.is_gpu_capable(),
                "gpu_ml_ready": self.is_gpu_capable(min_memory_gb=6.0, min_compute_capability="6.0")
            }
        }
        
    def _get_system_info(self) -> Dict[str, Any]:
        return {
            "cpu_count": psutil.cpu_count(),
            "cpu_count_logical": psutil.cpu_count(logical=True),
            "memory_total": psutil.virtual_memory().total,
            "boot_time": psutil.boot_time()
        }
        
    def _get_resource_usage(self) -> Dict[str, Any]:
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        return {
            "cpu_usage": psutil.cpu_percent(interval=1),
            "memory_usage": memory.percent,
            "memory_total": memory.total,
            "memory_available": memory.available,
            "memory_used": memory.used,
            "disk_usage": disk.percent,
            "disk_total": disk.total,
            "disk_free": disk.free
        }
        
    def _get_task_stats(self) -> Dict[str, Any]:
        if not self.task_history:
            return {
                "total_tasks": 0,
                "completed_tasks": 0,
                "failed_tasks": 0,
                "avg_duration": 0.0,
                "success_rate": 0.0
            }
            
        completed = [t for t in self.task_history if t.get("status") == "completed"]
        failed = [t for t in self.task_history if t.get("status") == "failed"]
        
        avg_duration = 0.0
        if completed:
            total_duration = sum(t.get("duration", 0) for t in completed)
            avg_duration = total_duration / len(completed)
            
        success_rate = len(completed) / len(self.task_history) * 100 if self.task_history else 0
        
        return {
            "total_tasks": len(self.task_history),
            "completed_tasks": len(completed),
            "failed_tasks": len(failed),
            "avg_duration": avg_duration,
            "success_rate": success_rate
        }
        
    def _get_overall_status(self) -> str:
        try:
            cpu_usage = psutil.cpu_percent(interval=1)
            memory_usage = psutil.virtual_memory().percent
            
            if cpu_usage > 90 or memory_usage > 90:
                return "critical"
            elif cpu_usage > 70 or memory_usage > 70:
                return "warning"
            else:
                return "healthy"
        except Exception:
            return "unknown"
            
    def record_task(self, task_id: str, status: str, duration: float = 0.0):
        task_record = {
            "task_id": task_id,
            "status": status,
            "duration": duration,
            "timestamp": datetime.now().isoformat()
        }
        
        self.task_history.append(task_record)
        
        if len(self.task_history) > self.max_history:
            self.task_history = self.task_history[-self.max_history:]

    def get_detailed_gpu_info(self) -> Dict[str, Any]:
        """Get comprehensive GPU information using multiple methods"""
        gpu_info = {
            "available": self.gpu_enabled,
            "count": 0,
            "devices": [],
            "total_memory_gb": 0,
            "driver_version": None
        }

        if not self.gpu_enabled:
            return gpu_info

        try:
            # Method 1: PyTorch CUDA info
            if torch.cuda.is_available():
                gpu_info["count"] = torch.cuda.device_count()
                gpu_info["cuda_version"] = torch.version.cuda

                for i in range(torch.cuda.device_count()):
                    props = torch.cuda.get_device_properties(i)
                    device_info = {
                        "id": i,
                        "name": props.name,
                        "memory_total_gb": props.total_memory / (1024**3),
                        "memory_allocated_gb": torch.cuda.memory_allocated(i) / (1024**3),
                        "memory_reserved_gb": torch.cuda.memory_reserved(i) / (1024**3),
                        "compute_capability": f"{props.major}.{props.minor}",
                        "multiprocessor_count": props.multi_processor_count
                    }
                    gpu_info["devices"].append(device_info)
                    gpu_info["total_memory_gb"] += device_info["memory_total_gb"]

        except Exception as e:
            logger.warning(f"Failed to get PyTorch GPU info: {e}")

        try:
            # Method 2: PYNVML for detailed NVIDIA info
            if PYNVML_AVAILABLE:
                driver_version = pynvml.nvmlSystemGetDriverVersion()
                gpu_info["driver_version"] = driver_version.decode('utf-8')

                device_count = pynvml.nvmlDeviceGetCount()
                for i in range(device_count):
                    handle = pynvml.nvmlDeviceGetHandleByIndex(i)

                    # Get additional info not available through PyTorch
                    try:
                        temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
                        power_usage = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0  # Convert to watts
                        utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)

                        if i < len(gpu_info["devices"]):
                            gpu_info["devices"][i].update({
                                "temperature_c": temp,
                                "power_usage_w": power_usage,
                                "gpu_utilization": utilization.gpu,
                                "memory_utilization": utilization.memory
                            })
                    except Exception as e:
                        logger.debug(f"Failed to get detailed info for GPU {i}: {e}")

        except Exception as e:
            logger.warning(f"Failed to get PYNVML GPU info: {e}")

        try:
            # Method 3: nvidia-smi fallback
            if not gpu_info["devices"] and self._nvidia_smi_available():
                smi_info = self._get_nvidia_smi_info()
                if smi_info:
                    gpu_info.update(smi_info)

        except Exception as e:
            logger.warning(f"Failed to get nvidia-smi info: {e}")

        return gpu_info

    def _nvidia_smi_available(self) -> bool:
        """Check if nvidia-smi is available"""
        try:
            subprocess.run(['nvidia-smi', '--version'],
                         capture_output=True, check=True, timeout=5)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            return False

    def _get_nvidia_smi_info(self) -> Optional[Dict[str, Any]]:
        """Get GPU info using nvidia-smi"""
        try:
            result = subprocess.run([
                'nvidia-smi', '--query-gpu=index,name,memory.total,memory.used,memory.free,temperature.gpu,power.draw,utilization.gpu,utilization.memory',
                '--format=csv,noheader,nounits'
            ], capture_output=True, text=True, timeout=10)

            if result.returncode != 0:
                return None

            devices = []
            total_memory_gb = 0

            for line in result.stdout.strip().split('\n'):
                if line.strip():
                    parts = [p.strip() for p in line.split(',')]
                    if len(parts) >= 9:
                        memory_total_mb = float(parts[2]) if parts[2] != '[Not Supported]' else 0
                        memory_used_mb = float(parts[3]) if parts[3] != '[Not Supported]' else 0
                        memory_free_mb = float(parts[4]) if parts[4] != '[Not Supported]' else 0

                        device_info = {
                            "id": int(parts[0]),
                            "name": parts[1],
                            "memory_total_gb": memory_total_mb / 1024,
                            "memory_used_gb": memory_used_mb / 1024,
                            "memory_free_gb": memory_free_mb / 1024,
                            "temperature_c": float(parts[5]) if parts[5] != '[Not Supported]' else None,
                            "power_usage_w": float(parts[6]) if parts[6] != '[Not Supported]' else None,
                            "gpu_utilization": float(parts[7]) if parts[7] != '[Not Supported]' else None,
                            "memory_utilization": float(parts[8]) if parts[8] != '[Not Supported]' else None
                        }
                        devices.append(device_info)
                        total_memory_gb += device_info["memory_total_gb"]

            return {
                "count": len(devices),
                "devices": devices,
                "total_memory_gb": total_memory_gb
            }

        except Exception as e:
            logger.warning(f"nvidia-smi query failed: {e}")
            return None

    def is_gpu_capable(self, min_memory_gb: float = 4.0, min_compute_capability: str = "3.5") -> bool:
        """Check if the system has GPU capability for ML workloads"""
        if not self.gpu_enabled:
            return False

        gpu_info = self.get_detailed_gpu_info()

        for device in gpu_info.get("devices", []):
            memory_gb = device.get("memory_total_gb", 0)
            compute_cap = device.get("compute_capability", "0.0")

            if memory_gb >= min_memory_gb:
                try:
                    if float(compute_cap) >= float(min_compute_capability):
                        return True
                except ValueError:
                    continue

        return False

health_monitor = HealthMonitor()