"""
Background Tasks - Placeholder for scheduled reminder tasks
Can be extended with Celery, APScheduler, or other task queues
"""
from datetime import datetime
from app.time_utils import utc_now
from typing import Dict, Any, Optional
import asyncio


class TaskScheduler:
    """
    Simple in-memory task scheduler placeholder.
    
    For production, replace with:
    - Celery + Redis for distributed task queue
    - APScheduler for process-based scheduling
    - AWS Lambda / Cloud Functions for serverless
    """
    
    def __init__(self):
        self.scheduled_tasks: Dict[str, Dict[str, Any]] = {}
        self._running = False
    
    def schedule_reminder(
        self,
        task_id: str,
        user_id: int,
        medication_id: int,
        schedule_id: int,
        scheduled_time: datetime,
        notification_config: Dict[str, bool]
    ) -> Dict[str, Any]:
        """
        Schedule a medication reminder task.
        
        Args:
            task_id: Unique task identifier
            user_id: User to notify
            medication_id: Medication ID
            schedule_id: Schedule ID
            scheduled_time: When to send reminder
            notification_config: Dict with notify_sms, notify_whatsapp, etc.
        """
        task = {
            "task_id": task_id,
            "user_id": user_id,
            "medication_id": medication_id,
            "schedule_id": schedule_id,
            "scheduled_time": scheduled_time,
            "notification_config": notification_config,
            "status": "scheduled",
            "created_at": utc_now()
        }
        
        self.scheduled_tasks[task_id] = task
        
        return {
            "success": True,
            "task_id": task_id,
            "scheduled_for": scheduled_time.isoformat()
        }
    
    def cancel_reminder(self, task_id: str) -> bool:
        """Cancel a scheduled reminder"""
        if task_id in self.scheduled_tasks:
            self.scheduled_tasks[task_id]["status"] = "cancelled"
            return True
        return False
    
    def reschedule_reminder(
        self,
        task_id: str,
        new_time: datetime
    ) -> Dict[str, Any]:
        """Reschedule a reminder (for snooze)"""
        if task_id not in self.scheduled_tasks:
            return {"success": False, "error": "Task not found"}
        
        self.scheduled_tasks[task_id]["scheduled_time"] = new_time
        self.scheduled_tasks[task_id]["status"] = "rescheduled"
        
        return {
            "success": True,
            "task_id": task_id,
            "new_time": new_time.isoformat()
        }
    
    def get_pending_tasks(self, user_id: Optional[int] = None) -> list:
        """Get all pending tasks, optionally filtered by user"""
        tasks = []
        for task in self.scheduled_tasks.values():
            if task["status"] in ["scheduled", "rescheduled"]:
                if user_id is None or task["user_id"] == user_id:
                    tasks.append(task)
        return sorted(tasks, key=lambda x: x["scheduled_time"])
    
    async def send_reminder(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a reminder notification.
        
        In production, implement actual notification sending:
        - SMS via Twilio
        - WhatsApp via Twilio/360dialog
        - Push notifications via Firebase
        - Email via SendGrid/SES
        """
        config = task["notification_config"]
        results = {}
        
        if config.get("notify_sms"):
            results["sms"] = await self._send_sms(task)
        
        if config.get("notify_whatsapp"):
            results["whatsapp"] = await self._send_whatsapp(task)
        
        if config.get("notify_push"):
            results["push"] = await self._send_push(task)
        
        if config.get("notify_email"):
            results["email"] = await self._send_email(task)
        
        if config.get("notify_voice_call"):
            results["voice"] = await self._send_voice_call(task)
        
        task["status"] = "sent"
        task["sent_at"] = utc_now()
        
        return {"success": True, "channels": results}
    
    async def _send_sms(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send SMS reminder via Twilio.
        
        ```python
        # Production implementation:
        from twilio.rest import Client
        
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=f"Reminder: Time to take {medication_name}",
            from_=twilio_number,
            to=user_phone
        )
        return {"status": "sent", "sid": message.sid}
        ```
        """
        # Mock implementation
        return {"status": "mock_sent", "message": "SMS reminder sent"}
    
    async def _send_whatsapp(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Send WhatsApp reminder"""
        # Mock implementation
        return {"status": "mock_sent", "message": "WhatsApp reminder sent"}
    
    async def _send_push(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Send push notification via Firebase"""
        # Mock implementation
        return {"status": "mock_sent", "message": "Push notification sent"}
    
    async def _send_email(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Send email reminder"""
        # Mock implementation
        return {"status": "mock_sent", "message": "Email reminder sent"}
    
    async def _send_voice_call(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Make voice call for critical medication"""
        # Mock implementation
        return {"status": "mock_sent", "message": "Voice call initiated"}


# Singleton instance
task_scheduler = TaskScheduler()


# APScheduler integration example (uncomment to use):
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger

scheduler = AsyncIOScheduler()

def schedule_medication_reminder(
    job_id: str,
    run_time: datetime,
    user_id: int,
    medication_id: int
):
    scheduler.add_job(
        send_reminder_notification,
        trigger=DateTrigger(run_date=run_time),
        id=job_id,
        args=[user_id, medication_id],
        replace_existing=True
    )

async def send_reminder_notification(user_id: int, medication_id: int):
    # Implement notification logic here
    pass

# Start scheduler on app startup
scheduler.start()
"""


# Celery integration example (uncomment to use):
"""
from celery import Celery

celery_app = Celery(
    'tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

@celery_app.task
def send_medication_reminder(user_id: int, medication_id: int, schedule_id: int):
    # Fetch user and medication from database
    # Send notifications
    pass

# Schedule task
from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    'check-pending-reminders': {
        'task': 'tasks.check_pending_reminders',
        'schedule': 60.0,  # Every minute
    },
}
"""



