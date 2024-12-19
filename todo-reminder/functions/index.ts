import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const sendScheduledNotifications = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const db = admin.firestore();
  const usersSnapshot = await db.collection('users').get();

  usersSnapshot.forEach(async (userDoc) => {
    const userData = userDoc.data();
    const selectedDays = userData.selectedDays || [];
    const today = new Date().getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday

    if (selectedDays.includes(today)) {
      // 通知を送信するロジックをここに追加
      console.log(`Sending notification to user: ${userDoc.id}`);
    }
  });

  return null;
}); 