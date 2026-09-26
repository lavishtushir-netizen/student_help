/**
 * Student Help - Web Push & Browser Notifications Utility
 * Integrates browser native Notification API with simulated Firebase Cloud Messaging
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function showBrowserNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        icon: '/logo.png',
        badge: '/favicon.ico',
        ...options
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return notif;
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}
