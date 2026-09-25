const CACHE_NAME = 'kumba-v1'
const STATIC_CACHE = 'kumba-static-v1'

const PRECACHE_URLS = [
  '/',
  '/app',
  '/manifest.json',
  '/icon.svg',
  '/apple-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      }).catch(() => cached)

      return cached || fetchPromise
    })
  )
})

self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'Kumba', body: 'You have a new notification' }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-dark-32x32.png',
      badge: '/icon-dark-32x32.png',
      vibrate: [100, 50, 100],
      data: { url: '/app' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/app')
  )
})
