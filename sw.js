// Service worker: salva tutti i quaderni sul dispositivo per l'uso offline.
const VERSION="20261012002757";
const CACHE="quaderni-"+VERSION;
const FILES=["./","index.html","elettrotecnica.html","numeri-complessi.html","meccanica-fluidi.html","fisica-tecnica.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request;if(req.method!=="GET")return;
  const url=new URL(req.url);
  // Font di Google: salvati alla prima apertura, poi letti dalla cache
  if(url.host==="fonts.googleapis.com"||url.host==="fonts.gstatic.com"){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{c.put(req,r.clone());return r}).catch(()=>hit))));return}
  if(url.origin!==location.origin)return;
  // Pagine: prima la rete (così gli aggiornamenti arrivano subito), se offline la copia salvata
  e.respondWith(fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp))}return r})
    .catch(()=>caches.match(req,{ignoreSearch:true}).then(hit=>hit||caches.match("index.html"))));
});
