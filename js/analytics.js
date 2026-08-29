const trackingEndpoint = new URL("../api/track", import.meta.url);

if (navigator.doNotTrack !== "1" && window.doNotTrack !== "1") {
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
