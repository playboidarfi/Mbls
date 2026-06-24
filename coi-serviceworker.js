/*! coi-serviceworker v0.1.7 | MIT License | https://github.com/gzuidhof/coi-serviceworker */
if (typeof window === "undefined") {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
    self.onfetch = (event) => {
        if (event.request.method === "GET" && event.request.url.startsWith(self.location.origin)) {
            event.respondWith(
                fetch(event.request).then((response) => {
                    if (response.status === 0) return response;
                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: newHeaders });
                })
            );
        }
    };
} else {
    const n = navigator.serviceWorker;
    if (n) {
        n.register(window.document.currentScript.src).then((registration) => {
            registration.addEventListener("updatefound", () => location.reload());
            if (n.controller && !window.crossOriginIsolated) location.reload();
        });
    }
}
