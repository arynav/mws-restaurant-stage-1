var cacheName = 'mws-restaurant-v10';
var imgsCache = 'mws-restaurant-imgs-v2';
var allCaches = [
    cacheName,
    imgsCache
];

// install service worker
self.addEventListener('install', function (event) {

    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll([
                '/',
                '/css/responsive.css',
                '/css/styles.css',
                // '/data/restaurants.json',
                '/img/na.png',
                '/img/',
                '/index.html',
                '/restaurant.html',
                '/js/',
                '/js/dbhelper.js',
                '/js/main.js',
                '/js/restaurant_info.js',
                '/js/sw_register.js'

            ]);
        })
    );
});
// add events to cache
self.addEventListener('fetch', function(event) {
    var requestUrl = new URL(event.request.url);
  
    if (requestUrl.origin === location.origin) {
      if (requestUrl.pathname === '/') {
        event.respondWith(caches.match('/index.html'));
        return;
      }
      if (requestUrl.pathname.endsWith('.jpg') || requestUrl.pathname.endsWith('.png')) {
        event.respondWith(serveImg(event.request));
        return;
      }
    }
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      }).catch(function(err) {       // fallback 
          console.log("You are OFFLINE: ",err);
          return;

        })
      
    );
  });

function serveImg(request) {
    var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');
    return caches.open(imgsCache).then(function(cache) {
      return cache.match(storageUrl).then(function(response) {

        if (response) return response;
        return fetch(request).then(function(networkResponse) {
          cache.put(storageUrl, networkResponse.clone());
          // console.log("networkResponse", networkResponse);
          return networkResponse;
        });
      });
    });
};
// activate service worker
self.addEventListener('activate', function(event) {
    console.log("sw is activated");
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('mws-') &&
                   !allCaches.includes(cacheName);
            }).map(function(cacheName) {
                return caches.delete(cacheName);
            })
        );
      })
    );
});


