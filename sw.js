var cacheName = 'mws-restaurant-v2';

self.addEventListener('install', function (event) {
    createDB();

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

self.addEventListener('fetch', function (event) {
    console.log('Fetching:.......', event.request.url);
    const checkURL = new URL(event.request.url);
    event.respondWith(
        caches.match(event.request).then(function (response) {

            if (response) {
                console.log('1. got some response:.......', response);
                return response;
            }
            return fetch(event.request);
        }
        )
    );
});

self.addEventListener('activate', function (event) {
    var cacheWhitelist = cacheName;
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cache) {
                    if (cacheWhitelist.indexOf(cache) === -1) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

const createDB = () => {

    // var db;
    // var request = indexedDB.open("idbTest", 8);
    // request.onerror = function(event) {
    //     console.log("Database error: " + e.target.errorCode);
    // };
    // request.onsuccess = function(event) {
    //     console.log("Database created");
    //     db = event.target.result;
    //     // var objectStore = db.createObjectStore("test", { keyPath: "myKey" });
    // };

    ///////////////////////////// test with indexedDB API
    // Open (or create) the database
    var open = indexedDB.open("mws_db", 2);

    // Create the schema
    open.onupgradeneeded = function () {
        var db = open.result;
        var store = db.createObjectStore("MyObjectStore", { keyPath: "id" });
        var index = store.createIndex("NameIndex", ["name"]);
    };

    open.onsuccess = function () {
        // Start a new transaction
        var db = open.result;
        var tx = db.transaction("MyObjectStore", "readwrite");
        var store = tx.objectStore("MyObjectStore");
        var index = store.index("NameIndex");

        // // Add some data
        store.put({ id: 12345, name: { first: "testtttttt", last: "Doe" }, age: 42 });
        // store.put({ id: 67890, name: { first: "Bob", last: "Smith" }, age: 35 });

        // // Query the data
        // var getJohn = store.get(12345);
        // var getBob = index.get(["Smith", "Bob"]);

        // getJohn.onsuccess = function () {
        //     console.log(getJohn.result.name.first);  // => "John"
        // };

        // getBob.onsuccess = function () {
        //     console.log(getBob.result.name.first);   // => "Bob"
        // };

        // Close the db when the transaction is done
        tx.oncomplete = function () {
            db.close();
        };
    }


}
//////////////////// idb api /////////////////

