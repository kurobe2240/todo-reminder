export const notification = {
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  showBreakNotification(duration: number): void {
    if (Notification.permission !== 'granted') return;

    const minutes = Math.floor(duration / 60);
    new Notification('休憩時間です', {
      body: `${minutes}分間の休憩を取りましょう`,
      icon: '/logo192.png',
    });

    // 通知音を再生
    this.playNotificationSound();
  },

  showWorkNotification(): void {
    if (Notification.permission !== 'granted') return;

    new Notification('作業再開の時間です', {
      body: '休憩時間が終了しました。作業を再開しましょう。',
      icon: '/logo192.png',
    });

    // 通知音を再生
    this.playNotificationSound();
  },

  playNotificationSound(): void {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => {
      console.error('通知音の再生に失敗しました:', error);
    });
  },
}; 