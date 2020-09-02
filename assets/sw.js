const CACHE_NAME = "v1";
const STATIC_CACHE_URLS = ["/json/index.json", "/assets/pdf.json"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => keys.filter(key => key !== CACHE_NAME))
      .then(keys =>
        Promise.all(
          keys.map(key => {
            console.log(`Deleting cache ${key}`);
            return caches.delete(key);
          })
        )
      )
  );
});

function cache(request, response) {
  if (response.type === "error" || response.type === "opaque") {
    return Promise.resolve();
  }
  return caches
    .open(CACHE_NAME)
    .then(cache => cache.put(request, response.clone()));
}

self.addEventListener("fetch", event => {
  event.respondWith(
    caches
      .match(event.request) // check if the request has already been cached
      .then(cached => cached || fetch(event.request)) // otherwise request network
      .then(
        response =>
          cache(event.request, response) // put response in cache
            .then(() => response) // resolve promise with the network response
      )
  );
});

