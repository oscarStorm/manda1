const trackingEndpoint = new URL("../api/track", import.meta.url);
const localHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const isLocalDevelopment = localHosts.has(window.location.hostname);

if (
  !isLocalDevelopment
  && navigator.doNotTrack !== "1"
  && window.doNotTrack !== "1"
) {
  fetch(trackingEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      path: window.location.pathname,
      referrer: document.referrer,
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interfere with the page experience.
  });
}
