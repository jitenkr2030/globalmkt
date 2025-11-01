#!/usr/bin/env python3
"""
ExoStack Integration Startup Script for Kronos Indian Stock Market Model
This script starts the ExoStack hub and agents with Kronos model integration.
"""

import os
import sys
import subprocess
import time
import signal
import threading
import logging
from pathlib import Path

# Add the integration directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "exostack-integration"))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ExoStackManager:
    """Manages ExoStack hub and agent processes."""
    
    def __init__(self, config_path: str = None):
        self.config_path = config_path or ".env.exostack"
        self.hub_process = None
        self.agent_processes = []
        self.running = False
        
        # Load configuration
        self.config = self._load_config()
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _load_config(self) -> dict:
        """Load configuration from environment file."""
        config = {}
        
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, 'r') as f:
                    for line in f:
                        if line.strip() and not line.startswith('#'):
                            key, value = line.strip().split('=', 1)
                            config[key] = value
            else:
                logger.warning(f"Config file {self.config_path} not found, using defaults")
                config = self._get_default_config()
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            config = self._get_default_config()
        
        return config
    
    def _get_default_config(self) -> dict:
        """Get default configuration."""
        return {
            'EXOSTACK_HUB_URL': 'http://localhost:8000',
            'EXOSTACK_AGENT_URL': 'http://localhost:8001',
            'EXOSTACK_DATABASE_URL': 'sqlite:///./exostack.db',
            'EXOSTACK_REDIS_URL': 'redis://localhost:6379/0',
            'EXOSTACK_ENABLE_GPU': 'true',
            'EXOSTACK_MAX_CONCURRENT_TASKS': '10',
            'EXOSTACK_LOG_LEVEL': 'INFO'
        }
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        logger.info(f"Received signal {signum}, shutting down...")
        self.stop()
        sys.exit(0)
    
    def start(self):
        """Start ExoStack hub and agents."""
        logger.info("Starting ExoStack integration...")
        
        try:
            # Set environment variables
            for key, value in self.config.items():
                os.environ[key] = value
            
            # Start hub
            self._start_hub()
            
            # Wait for hub to be ready
            self._wait_for_hub()
            
            # Start agents
            self._start_agents()
            
            self.running = True
            logger.info("ExoStack integration started successfully")
            
            # Keep the script running
            try:
                while self.running:
                    time.sleep(1)
            except KeyboardInterrupt:
                logger.info("Received keyboard interrupt")
            finally:
                self.stop()
                
        except Exception as e:
            logger.error(f"Failed to start ExoStack: {e}")
            self.stop()
            sys.exit(1)
    
    def _start_hub(self):
        """Start the ExoStack hub."""
        logger.info("Starting ExoStack hub...")
        
        hub_script = Path(__file__).parent / "exostack-integration" / "hub" / "main.py"
        
        if not hub_script.exists():
            raise FileNotFoundError(f"Hub script not found: {hub_script}")
        
        # Start hub process
        self.hub_process = subprocess.Popen(
            [sys.executable, str(hub_script)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        logger.info(f"Hub started with PID: {self.hub_process.pid}")
    
    def _start_agents(self):
        """Start ExoStack agents."""
        logger.info("Starting ExoStack agents...")
        
        agent_script = Path(__file__).parent / "exostack-integration" / "agent" / "main.py"
        
        if not agent_script.exists():
            raise FileNotFoundError(f"Agent script not found: {agent_script}")
        
        # Start multiple agents for different regions
        regions = ["MUMBAI", "DELHI", "BANGALORE", "CHENNAI", "KOLKATA"]
        
        for i, region in enumerate(regions):
            env = os.environ.copy()
            env['AGENT_ID'] = f'agent-{region.lower()}'
            env['AGENT_PORT'] = str(8001 + i)
            env['AGENT_REGION'] = region
            
            process = subprocess.Popen(
                [sys.executable, str(agent_script)],
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            self.agent_processes.append(process)
            logger.info(f"Agent {region} started with PID: {process.pid}")
    
    def _wait_for_hub(self):
        """Wait for hub to be ready."""
        logger.info("Waiting for hub to be ready...")
        
        import requests
        
        hub_url = self.config.get('EXOSTACK_HUB_URL', 'http://localhost:8000')
        max_attempts = 30
        attempt = 0
        
        while attempt < max_attempts:
            try:
                response = requests.get(f"{hub_url}/health", timeout=5)
                if response.status_code == 200:
                    logger.info("Hub is ready!")
                    return
            except requests.RequestException:
                pass
            
            attempt += 1
            time.sleep(2)
            logger.info(f"Waiting for hub... (attempt {attempt}/{max_attempts})")
        
        raise TimeoutError("Hub failed to start within expected time")
    
    def stop(self):
        """Stop all ExoStack processes."""
        logger.info("Stopping ExoStack integration...")
        
        self.running = False
        
        # Stop agents
        for process in self.agent_processes:
            if process.poll() is None:
                process.terminate()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    process.kill()
        
        # Stop hub
        if self.hub_process and self.hub_process.poll() is None:
            self.hub_process.terminate()
            try:
                self.hub_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.hub_process.kill()
        
        logger.info("ExoStack integration stopped")
    
    def status(self):
        """Get status of ExoStack processes."""
        status = {
            "running": self.running,
            "hub": {
                "pid": self.hub_process.pid if self.hub_process else None,
                "alive": self.hub_process.poll() is None if self.hub_process else False
            },
            "agents": []
        }
        
        for i, process in enumerate(self.agent_processes):
            status["agents"].append({
                "id": f"agent-{i}",
                "pid": process.pid,
                "alive": process.poll() is None
            })
        
        return status


def main():
    """Main entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="ExoStack Integration Manager")
    parser.add_argument("--config", help="Configuration file path", default=".env.exostack")
    parser.add_argument("--status", action="store_true", help="Show status and exit")
    parser.add_argument("--hub-only", action="store_true", help="Start hub only")
    parser.add_argument("--agents", type=int, help="Number of agents to start", default=5)
    
    args = parser.parse_args()
    
    manager = ExoStackManager(args.config)
    
    if args.status:
        status = manager.status()
        print(json.dumps(status, indent=2))
        return
    
    try:
        manager.start()
    except Exception as e:
        logger.error(f"Failed to start ExoStack: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()