/* Berufsschul-Quiz – Service Worker: macht die App offline nutzbar */
const CACHE='bsquiz-4.7';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  if(req.mode==='navigate'){
    /* Seite: erst online versuchen (für Updates), sonst gespeicherte Version */
    e.respondWith(fetch(req).then(r=>{ const copy=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',copy)); return r; }).catch(()=>caches.match('./index.html')));
    return;
  }
  /* Alles andere (Symbole, Schriften, Zusatzprogramme): gespeicherte Version, im Hintergrund auffrischen */
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{ if(r&&(r.ok||r.type==='opaque')){ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(req,copy)); } return r; }).catch(()=>hit);
    return hit||net;
  }));
});
