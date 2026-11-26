// B-WEB (Nov 26): the browser game's offline helper (a "service worker": a small script the browser keeps
// beside the page). It keeps a copy of every game file the player has already loaded, so a game added to the
// home screen still opens and plays with a weak or dropped connection.
//
// Always the newest files first: each file is asked from the network, and the saved copy is used only when
// the network fails or takes longer than WAIT_MS. So an update is never hidden behind an old copy.
// Only this game's own files are kept (nothing from other sites), and nothing is ever sent anywhere.
// Not used inside the phone apps (their files are already on the phone).

const CACHE = 'dojo-ascent-v1';
const WAIT_MS = 4000;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin || req.headers.has('range')) return;
  event.respondWith(fromNetworkThenCache(req));
});

async function fromNetworkThenCache(req) {
  const cache = await caches.open(CACHE);
  const network = fetch(req).then(async (res) => {
    // Keep only whole, good answers from this site.
    if (res.ok && res.status === 200 && res.type === 'basic') await cache.put(req, res.clone());
    return res;
  });
  const saved = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
  if (!saved) return network;
  // A saved copy exists: use the network if it answers in time, else the copy.
  let timer;
  const slow = new Promise((resolve) => (timer = setTimeout(() => resolve(saved), WAIT_MS)));
  try {
    return await Promise.race([network.catch(() => saved), slow]);
  } finally {
    clearTimeout(timer);
  }
}
