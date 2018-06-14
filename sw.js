var cacheName = 'mws-restaurant-v1';

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll([
                '/',
                '/css/responsive.css',
                '/css/styles.css',
                '/data/restaurants.json',
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

self.addEventListener('fetch', function (event) {
    console.log('Fetching:.......', event.request.url);
    event.respondWith(
        caches.match(event.request).then(function (response) {

            if (response) {
                console.log('1. got some responce:.......', response);
                return response;
            }
            return fetch(event.request);
        }
        )
    );
});

// self.addEventListener('activate', function(event) {
//     var cacheWhitelist = cacheName;
//     event.waitUntil(
//       caches.keys().then(function(cacheNames) {
//         return Promise.all(
//           cacheNames.map(function(cache) {
//             if (cacheWhitelist.indexOf(cache) === -1) {
//               return caches.delete(cache);
//             }
//           })
//         );
//       })
//     );
//   });