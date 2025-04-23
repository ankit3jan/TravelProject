const CACHE_NAME = "my-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/app.js",
    "normalize.css",
    "destination.html",
    "gallery.html",
    "contact.html",
    "about.html",
    "/assets/beach.jpeg",
    "/assets/city.jpeg",
    "/assets/forest.jpeg",
    "/assets/himalayas.jpg",
    "/assets/forest.jpeg",
    "/assets/himalayas.webp",
    "/assets/maldives.jpg",
    "/assets/mountain.jpg",
    "/assets/paris.jpg",
    "/assets/pexels-miki-czetti-26377-111963.jpg",
    "/assets\pexels-miki-czetti-26377-111963.webp",
    "/assets/pexels-pixabay-237272.jpg",
    "/assets/pexels-pixabay-237272.webp",
    "/assets/pexels-souvenirpixels-1531660.jpg",
    "/assets/pexels-souvenirpixels-1531660.webp",
    "/assets/tokyo.jpg",
    "/assets/Travel-Wallpaper-Free-Download.jpg",
    
];

// Install event: Caches the assets
self.addEventListener("install", (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching assets');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: All assets cached');
                return self.skipWaiting(); // Force activation
            })
            .catch((error) => {
                console.error('Service Worker: Caching failed', error);
            })
    );
});

// Fetch event: Serve cached or fetch from network
self.addEventListener("fetch", (event) => {
    if (event.request.method !== 'GET') return;

    const requestURL = new URL(event.request.url);

    // Ignore non-HTTP(s) requests like chrome-extension://
    if (!requestURL.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }

                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then((networkResponse) => {
                        if (
                            !networkResponse ||
                            networkResponse.status !== 200 ||
                            networkResponse.type !== 'basic'
                        ) {
                            return networkResponse;
                        }

                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Only cache HTTP(S) requests from your domain
                                if (event.request.url.startsWith(self.location.origin)) {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Fetch failed', error);
                        // Optional: return custom offline response
                    });
            })
    );
});


// Activate event: Clean up old caches
self.addEventListener("activate", (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim(); // Take control immediately
        })
  );
});