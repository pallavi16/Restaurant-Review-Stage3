var CACHE_VERSION = 'restaurant-static-v1';
var CACHE_URLS = [
          '/',
          '/index.html',
          '/restaurant.html',
          '/js/app.js',
          '/sw.js',
          '/js/dbhelper.js',
          'js/idb.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/css/styles.css',
          '/img/1.jpg',
          '/img/2.jpg',
          '/img/3.jpg',
          '/img/4.jpg',
          '/img/5.jpg',
          '/img/6.jpg',
          '/img/7.jpg',
          '/img/8.jpg',
          '/img/9.jpg',
          '/img/10.jpg'

];



self.addEventListener('install', function (event) {
 
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(CACHE_URLS);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('restaurant-') &&
                   cacheName != CACHE_VERSION;
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });
  
self.addEventListener('fetch', function(event) {

    
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        var fetchRequest = event.request.clone();
        

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

    
            var responseToCache = response.clone();
            console.log('response To Cache: ', responseToCache);

            caches.open(CACHE_VERSION)
              .then(function(cache) {
                console.log('responseToCache stored: ', cache);
              });

            return response;
          }
        );
      })
    );
});

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

  