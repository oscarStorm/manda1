const navigationScript = document.currentScript;
const siteRoot = new URL("../", navigationScript.src);

const routes = [
  { path: "boids/", label: "boids" },
  { path: "goat-game/", label: "goat_game" },
  { path: "worm/", label: "worm" },
  { path: "profile/", label: "profile" },
];

function normalizePath(pathname) {
  return pathname.replace(/index\.html$/, "").replace(/\/$/, "");
}

class SiteNavigation extends HTMLElement {
  connectedCallback() {
    const nav = document.createElement("nav");
    nav.className = "route-nav";
    nav.setAttribute("aria-label", "Site navigation");

    for (const route of routes) {
      const link = document.createElement("a");
      link.href = new URL(route.path, siteRoot).href;
      link.textContent = route.label;

      if (normalizePath(link.pathname) === normalizePath(window.location.pathname)) {
        link.setAttribute("aria-current", "page");
      }

      nav.append(link);
    }

    this.replaceChildren(nav);
  }
}

customElements.define("site-navigation", SiteNavigation);

import("./analytics.js");
