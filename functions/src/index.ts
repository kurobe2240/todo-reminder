import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();

// 定期的な通知を送信する関数
export const scheduledNotification = onSchedule({
  schedule: '0 9 * * *',  // 毎日午前9時に実行
  timeZone: 'Asia/Tokyo',
}, async (_context) => {
  try {
    const message = {
      notification: {
        title: 'デイリーリマインダー',
        body: '本日のタスクを確認しましょう！',
      },
      topic: 'daily-reminder'
    };

    await admin.messaging().send(message);
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
});

// タスク期限が近づいた時の通知を送信する関数
export const taskDueNotification = onDocumentCreated('tasks/{taskId}', 
  async (event) => {
    const task = event.data?.data();
    if (!task?.dueDate) return;

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const timeUntilDue = dueDate.getTime() - now.getTime();
    const hoursUntilDue = timeUntilDue / (1000 * 60 * 60);

    if (hoursUntilDue <= 24) {
      try {
        const message = {
          notification: {
            title: 'タスク期限が近づいています',
            body: `タスク「${task.title}」の期限まであと${Math.floor(hoursUntilDue)}時間です。`,
          },
          topic: 'task-due'
        };

        await admin.messaging().send(message);
        console.log('Due date notification sent successfully');
      } catch (error) {
        console.error('Error sending due date notification:', error);
      }
    }
  }); 