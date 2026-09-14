// MedX Emergency SOS - Service Worker for Web Push & Background Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Handle Web Push Events (from Cloud Server / FCM / VAPID Push Protocol)
 */
self.addEventListener('push', (event) => {
  let data = {
    title: '🚨 CRITICAL EMERGENCY SOS ALERT',
    body: 'A critical patient SOS signal was triggered!',
    icon: '/favicon.svg',
    tag: 'medx-sos-push',
    data: { url: '/?tab=emergency' }
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || `sos-${Date.now()}`,
    renotify: true,
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 600, 100, 300], // SOS Morse code vibration pattern for mobile
    data: data.data || { url: '/?tab=emergency' },
    actions: [
      { action: 'open_emergency', title: '🚨 View Emergency Desk' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Handle PostMessage Events (from Frontend State / App Event Handlers)
 */
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'TRIGGER_SOS_PUSH' || event.data.type === 'EMERGENCY_ALERT')) {
    const payload = event.data.payload || event.data;
    const title = payload.title || '🚨 CRITICAL EMERGENCY SOS ALERT';

    const options = {
      body: payload.body || 'A critical patient SOS signal was triggered!',
      icon: payload.icon || '/favicon.svg',
      badge: '/favicon.svg',
      tag: payload.tag || `sos-${Date.now()}`,
      renotify: true,
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 600, 100, 300],
      data: payload.data || { url: '/?tab=emergency' },
      actions: [
        { action: 'open_emergency', title: '🚨 View Emergency Desk' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

/**
 * Handle Notification Click Events (Focus or open Doctor Dashboard on connected device)
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/?tab=emergency';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.navigate) client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
