// Service worker mínimo: permite instalar o app na tela inicial.
// Não guarda páginas em cache para que ninguém veja conteúdo desatualizado.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
