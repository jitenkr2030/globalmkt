"""
Alert Manager for ExoStack
Implements comprehensive alerting system with threshold monitoring, notifications, and escalation
"""
import asyncio
import logging
import smtplib
import json
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Callable, Union
from dataclasses import dataclass, asdict
from enum import Enum
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
import aiofiles
from pathlib import Path

from shared.database.services import node_service, task_service, metrics_service
from shared.database.models import Alert, AlertType, AlertSeverity, Node, Task

logger = logging.getLogger(__name__)

class ThresholdType(str, Enum):
    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    GPU_USAGE = "gpu_usage"
    DISK_USAGE = "disk_usage"
    TASK_FAILURE_RATE = "task_failure_rate"
    NODE_HEARTBEAT = "node_heartbeat"
    QUEUE_LENGTH = "queue_length"
    RESPONSE_TIME = "response_time"

class NotificationChannel(str, Enum):
    EMAIL = "email"
    WEBHOOK = "webhook"
    SLACK = "slack"
    DISCORD = "discord"
    SMS = "sms"

@dataclass
class ThresholdRule:
    """Threshold monitoring rule"""
    rule_id: str
    name: str
    threshold_type: ThresholdType
    
    # Threshold values
    warning_threshold: float
    critical_threshold: float
    
    # Evaluation settings
    evaluation_window_minutes: int = 5
    consecutive_violations: int = 2
    
    # Target settings
    target_nodes: List[str] = None  # Empty = all nodes
    target_models: List[str] = None  # Empty = all models
    
    # Notification settings
    notification_channels: List[NotificationChannel] = None
    escalation_delay_minutes: int = 30
    
    # Status
    enabled: bool = True
    last_evaluated: Optional[datetime] = None
    current_violations: int = 0
    
    def __post_init__(self):
        if self.target_nodes is None:
            self.target_nodes = []
        if self.target_models is None:
            self.target_models = []
        if self.notification_channels is None:
            self.notification_channels = [NotificationChannel.EMAIL]

@dataclass
class NotificationConfig:
    """Notification channel configuration"""
    channel: NotificationChannel
    
    # Email settings
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    email_from: Optional[str] = None
    email_to: List[str] = None
    
    # Webhook settings
    webhook_url: Optional[str] = None
    webhook_headers: Dict[str, str] = None
    webhook_auth_token: Optional[str] = None
    
    # Slack settings
    slack_webhook_url: Optional[str] = None
    slack_channel: Optional[str] = None
    
    # Rate limiting
    rate_limit_minutes: int = 15  # Minimum time between notifications of same type
    
    def __post_init__(self):
        if self.email_to is None:
            self.email_to = []
        if self.webhook_headers is None:
            self.webhook_headers = {}

class AlertManager:
    """Comprehensive alert management system"""
    
    def __init__(self, config_path: str = "shared/config/alert_config.json"):
        self.config_path = Path(config_path)
        self.threshold_rules: Dict[str, ThresholdRule] = {}
        self.notification_configs: Dict[NotificationChannel, NotificationConfig] = {}
        
        # Alert state tracking
        self.active_alerts: Dict[str, Alert] = {}
        self.notification_history: Dict[str, datetime] = {}
        
        # Background tasks
        self.monitoring_task: Optional[asyncio.Task] = None
        self.monitoring_interval = 60  # seconds
        
        logger.info("AlertManager initialized")
    
    async def start(self):
        """Start the alert monitoring system"""
        await self.load_config()
        
        # Start monitoring task
        if not self.monitoring_task or self.monitoring_task.done():
            self.monitoring_task = asyncio.create_task(self._monitoring_loop())
            logger.info("Alert monitoring started")
    
    async def stop(self):
        """Stop the alert monitoring system"""
        if self.monitoring_task and not self.monitoring_task.done():
            self.monitoring_task.cancel()
            try:
                await self.monitoring_task
            except asyncio.CancelledError:
                pass
            logger.info("Alert monitoring stopped")
    
    async def load_config(self):
        """Load alert configuration from file"""
        try:
            if self.config_path.exists():
                async with aiofiles.open(self.config_path, 'r') as f:
                    content = await f.read()
                    config = json.loads(content)
                
                # Load threshold rules
                for rule_data in config.get('threshold_rules', []):
                    rule = ThresholdRule(**rule_data)
                    self.threshold_rules[rule.rule_id] = rule
                
                # Load notification configs
                for channel_name, channel_config in config.get('notification_configs', {}).items():
                    channel = NotificationChannel(channel_name)
                    self.notification_configs[channel] = NotificationConfig(
                        channel=channel,
                        **channel_config
                    )
                
                logger.info(f"Loaded {len(self.threshold_rules)} threshold rules and {len(self.notification_configs)} notification configs")
            else:
                await self._create_default_config()
                
        except Exception as e:
            logger.error(f"Failed to load alert config: {e}")
            await self._create_default_config()
    
    async def save_config(self):
        """Save alert configuration to file"""
        try:
            config = {
                'threshold_rules': [asdict(rule) for rule in self.threshold_rules.values()],
                'notification_configs': {
                    channel.value: asdict(config) 
                    for channel, config in self.notification_configs.items()
                }
            }
            
            # Ensure directory exists
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(self.config_path, 'w') as f:
                await f.write(json.dumps(config, indent=2, default=str))
            
            logger.info("Alert configuration saved")
            
        except Exception as e:
            logger.error(f"Failed to save alert config: {e}")
    
    async def add_threshold_rule(self, rule: ThresholdRule):
        """Add a new threshold monitoring rule"""
        self.threshold_rules[rule.rule_id] = rule
        await self.save_config()
        logger.info(f"Added threshold rule: {rule.name}")
    
    async def remove_threshold_rule(self, rule_id: str):
        """Remove a threshold monitoring rule"""
        if rule_id in self.threshold_rules:
            del self.threshold_rules[rule_id]
            await self.save_config()
            logger.info(f"Removed threshold rule: {rule_id}")
    
    async def trigger_alert(
        self,
        alert_type: AlertType,
        severity: AlertSeverity,
        title: str,
        message: str,
        node_id: Optional[str] = None,
        task_id: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Manually trigger an alert"""
        
        alert_id = f"{alert_type.value}_{node_id or 'system'}_{int(datetime.now().timestamp())}"
        
        # Create alert in database
        alert_data = {
            "alert_type": alert_type,
            "severity": severity,
            "title": title,
            "message": message,
            "node_id": node_id,
            "task_id": task_id,
            "context": context or {}
        }
        
        # Store in active alerts
        self.active_alerts[alert_id] = alert_data
        
        # Send notifications
        await self._send_notifications(alert_data)
        
        logger.warning(f"Alert triggered: {title} ({severity.value})")
        return alert_id
    
    async def resolve_alert(self, alert_id: str):
        """Resolve an active alert"""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert["resolved"] = True
            alert["resolved_at"] = datetime.now(timezone.utc)
            
            # Send resolution notification
            await self._send_resolution_notification(alert)
            
            # Remove from active alerts
            del self.active_alerts[alert_id]
            
            logger.info(f"Alert resolved: {alert_id}")
    
    async def get_active_alerts(self) -> List[Dict[str, Any]]:
        """Get all active alerts"""
        return list(self.active_alerts.values())
    
    async def _monitoring_loop(self):
        """Main monitoring loop"""
        while True:
            try:
                await self._evaluate_thresholds()
                await asyncio.sleep(self.monitoring_interval)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}")
                await asyncio.sleep(self.monitoring_interval)
    
    async def _evaluate_thresholds(self):
        """Evaluate all threshold rules"""
        current_time = datetime.now(timezone.utc)
        
        for rule in self.threshold_rules.values():
            if not rule.enabled:
                continue
            
            try:
                await self._evaluate_rule(rule, current_time)
                rule.last_evaluated = current_time
            except Exception as e:
                logger.error(f"Failed to evaluate rule {rule.rule_id}: {e}")
    
    async def _evaluate_rule(self, rule: ThresholdRule, current_time: datetime):
        """Evaluate a specific threshold rule"""
        
        if rule.threshold_type == ThresholdType.CPU_USAGE:
            await self._evaluate_cpu_usage(rule)
        elif rule.threshold_type == ThresholdType.MEMORY_USAGE:
            await self._evaluate_memory_usage(rule)
        elif rule.threshold_type == ThresholdType.GPU_USAGE:
            await self._evaluate_gpu_usage(rule)
        elif rule.threshold_type == ThresholdType.NODE_HEARTBEAT:
            await self._evaluate_node_heartbeat(rule)
        elif rule.threshold_type == ThresholdType.TASK_FAILURE_RATE:
            await self._evaluate_task_failure_rate(rule)
        elif rule.threshold_type == ThresholdType.QUEUE_LENGTH:
            await self._evaluate_queue_length(rule)
    
    async def _evaluate_cpu_usage(self, rule: ThresholdRule):
        """Evaluate CPU usage threshold"""
        nodes = await node_service.get_active_nodes()
        
        for node in nodes:
            if rule.target_nodes and node.node_id not in rule.target_nodes:
                continue
            
            cpu_usage = node.cpu_usage_percent
            
            if cpu_usage >= rule.critical_threshold:
                await self._handle_threshold_violation(
                    rule, node.node_id, cpu_usage, AlertSeverity.CRITICAL,
                    f"Critical CPU usage on {node.node_id}: {cpu_usage:.1f}%"
                )
            elif cpu_usage >= rule.warning_threshold:
                await self._handle_threshold_violation(
                    rule, node.node_id, cpu_usage, AlertSeverity.MEDIUM,
                    f"High CPU usage on {node.node_id}: {cpu_usage:.1f}%"
                )
    
    async def _evaluate_memory_usage(self, rule: ThresholdRule):
        """Evaluate memory usage threshold"""
        nodes = await node_service.get_active_nodes()
        
        for node in nodes:
            if rule.target_nodes and node.node_id not in rule.target_nodes:
                continue
            
            memory_usage = node.memory_usage_percent
            
            if memory_usage >= rule.critical_threshold:
                await self._handle_threshold_violation(
                    rule, node.node_id, memory_usage, AlertSeverity.CRITICAL,
                    f"Critical memory usage on {node.node_id}: {memory_usage:.1f}%"
                )
            elif memory_usage >= rule.warning_threshold:
                await self._handle_threshold_violation(
                    rule, node.node_id, memory_usage, AlertSeverity.MEDIUM,
                    f"High memory usage on {node.node_id}: {memory_usage:.1f}%"
                )
    
    async def _evaluate_node_heartbeat(self, rule: ThresholdRule):
        """Evaluate node heartbeat failures"""
        heartbeat_threshold = datetime.now(timezone.utc) - timedelta(minutes=rule.warning_threshold)
        critical_threshold = datetime.now(timezone.utc) - timedelta(minutes=rule.critical_threshold)
        
        nodes = await node_service.get_active_nodes()
        
        for node in nodes:
            if rule.target_nodes and node.node_id not in rule.target_nodes:
                continue
            
            if node.last_heartbeat < critical_threshold:
                await self._handle_threshold_violation(
                    rule, node.node_id, 
                    (datetime.now(timezone.utc) - node.last_heartbeat).total_seconds() / 60,
                    AlertSeverity.CRITICAL,
                    f"Node {node.node_id} heartbeat failure - last seen {node.last_heartbeat}"
                )
            elif node.last_heartbeat < heartbeat_threshold:
                await self._handle_threshold_violation(
                    rule, node.node_id,
                    (datetime.now(timezone.utc) - node.last_heartbeat).total_seconds() / 60,
                    AlertSeverity.MEDIUM,
                    f"Node {node.node_id} heartbeat delayed - last seen {node.last_heartbeat}"
                )
    
    async def _handle_threshold_violation(
        self, 
        rule: ThresholdRule, 
        target_id: str, 
        current_value: float, 
        severity: AlertSeverity,
        message: str
    ):
        """Handle a threshold violation"""
        
        violation_key = f"{rule.rule_id}_{target_id}"
        
        # Check if we should trigger an alert
        if violation_key not in self.active_alerts:
            rule.current_violations += 1
            
            if rule.current_violations >= rule.consecutive_violations:
                # Trigger alert
                alert_id = await self.trigger_alert(
                    AlertType.RESOURCE_THRESHOLD,
                    severity,
                    f"Threshold Violation: {rule.name}",
                    message,
                    node_id=target_id if "node" in target_id else None,
                    context={
                        "rule_id": rule.rule_id,
                        "threshold_type": rule.threshold_type.value,
                        "current_value": current_value,
                        "threshold": rule.critical_threshold if severity == AlertSeverity.CRITICAL else rule.warning_threshold
                    }
                )
                
                self.active_alerts[violation_key] = alert_id
                rule.current_violations = 0  # Reset counter
        else:
            # Alert already active, check for escalation
            pass
    
    async def _send_notifications(self, alert: Dict[str, Any]):
        """Send notifications for an alert"""
        
        # Check rate limiting
        notification_key = f"{alert['alert_type']}_{alert.get('node_id', 'system')}"
        last_notification = self.notification_history.get(notification_key)
        
        if last_notification:
            time_since_last = datetime.now(timezone.utc) - last_notification
            if time_since_last.total_seconds() < 15 * 60:  # 15 minutes rate limit
                logger.debug(f"Rate limiting notification for {notification_key}")
                return
        
        # Send to all configured channels
        for channel, config in self.notification_configs.items():
            try:
                if channel == NotificationChannel.EMAIL:
                    await self._send_email_notification(alert, config)
                elif channel == NotificationChannel.WEBHOOK:
                    await self._send_webhook_notification(alert, config)
                elif channel == NotificationChannel.SLACK:
                    await self._send_slack_notification(alert, config)
            except Exception as e:
                logger.error(f"Failed to send {channel.value} notification: {e}")
        
        # Update notification history
        self.notification_history[notification_key] = datetime.now(timezone.utc)
    
    async def _send_email_notification(self, alert: Dict[str, Any], config: NotificationConfig):
        """Send email notification"""
        if not config.email_to or not config.smtp_host:
            return
        
        subject = f"[ExoStack Alert] {alert['title']}"
        
        body = f"""
        Alert Details:
        - Type: {alert['alert_type']}
        - Severity: {alert['severity']}
        - Message: {alert['message']}
        - Time: {datetime.now(timezone.utc).isoformat()}
        
        Node: {alert.get('node_id', 'N/A')}
        Task: {alert.get('task_id', 'N/A')}
        
        Context: {json.dumps(alert.get('context', {}), indent=2)}
        """
        
        msg = MIMEMultipart()
        msg['From'] = config.email_from
        msg['To'] = ', '.join(config.email_to)
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP(config.smtp_host, config.smtp_port) as server:
            server.starttls()
            if config.smtp_username and config.smtp_password:
                server.login(config.smtp_username, config.smtp_password)
            server.send_message(msg)
        
        logger.info(f"Email notification sent for alert: {alert['title']}")
    
    async def _send_webhook_notification(self, alert: Dict[str, Any], config: NotificationConfig):
        """Send webhook notification"""
        if not config.webhook_url:
            return
        
        headers = config.webhook_headers.copy()
        if config.webhook_auth_token:
            headers['Authorization'] = f"Bearer {config.webhook_auth_token}"
        
        payload = {
            "alert": alert,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "exostack"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                config.webhook_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
        
        logger.info(f"Webhook notification sent for alert: {alert['title']}")
    
    async def _send_slack_notification(self, alert: Dict[str, Any], config: NotificationConfig):
        """Send Slack notification"""
        if not config.slack_webhook_url:
            return
        
        color = {
            AlertSeverity.LOW: "good",
            AlertSeverity.MEDIUM: "warning", 
            AlertSeverity.HIGH: "danger",
            AlertSeverity.CRITICAL: "danger"
        }.get(alert['severity'], "warning")
        
        payload = {
            "channel": config.slack_channel,
            "username": "ExoStack Alert",
            "attachments": [{
                "color": color,
                "title": alert['title'],
                "text": alert['message'],
                "fields": [
                    {"title": "Severity", "value": alert['severity'], "short": True},
                    {"title": "Type", "value": alert['alert_type'], "short": True},
                    {"title": "Node", "value": alert.get('node_id', 'N/A'), "short": True},
                    {"title": "Time", "value": datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC'), "short": True}
                ]
            }]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                config.slack_webhook_url,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
        
        logger.info(f"Slack notification sent for alert: {alert['title']}")
    
    async def _send_resolution_notification(self, alert: Dict[str, Any]):
        """Send alert resolution notification"""
        resolution_alert = alert.copy()
        resolution_alert['title'] = f"RESOLVED: {alert['title']}"
        resolution_alert['message'] = f"Alert has been resolved: {alert['message']}"
        resolution_alert['severity'] = AlertSeverity.LOW
        
        await self._send_notifications(resolution_alert)
    
    async def _create_default_config(self):
        """Create default alert configuration"""
        
        # Default threshold rules
        default_rules = [
            ThresholdRule(
                rule_id="cpu_usage_default",
                name="CPU Usage Monitor",
                threshold_type=ThresholdType.CPU_USAGE,
                warning_threshold=80.0,
                critical_threshold=95.0,
                evaluation_window_minutes=5,
                consecutive_violations=2
            ),
            ThresholdRule(
                rule_id="memory_usage_default", 
                name="Memory Usage Monitor",
                threshold_type=ThresholdType.MEMORY_USAGE,
                warning_threshold=85.0,
                critical_threshold=95.0,
                evaluation_window_minutes=5,
                consecutive_violations=2
            ),
            ThresholdRule(
                rule_id="node_heartbeat_default",
                name="Node Heartbeat Monitor", 
                threshold_type=ThresholdType.NODE_HEARTBEAT,
                warning_threshold=5.0,  # 5 minutes
                critical_threshold=10.0,  # 10 minutes
                evaluation_window_minutes=2,
                consecutive_violations=1
            )
        ]
        
        for rule in default_rules:
            self.threshold_rules[rule.rule_id] = rule
        
        # Default notification config (email)
        self.notification_configs[NotificationChannel.EMAIL] = NotificationConfig(
            channel=NotificationChannel.EMAIL,
            smtp_host="localhost",
            smtp_port=587,
            email_from="alerts@exostack.local",
            email_to=["admin@exostack.local"]
        )
        
        await self.save_config()
        logger.info("Created default alert configuration")

# Global alert manager instance
alert_manager = AlertManager()
