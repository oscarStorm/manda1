import { createHmac } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const botPattern = /bot|crawler|spider|preview|headless|lighthouse/i;

function response(status, body = null) {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(body && { "Content-Type": "application/json" }),
    },
  });
}

function getVisitorHash(request, userAgent) {
  const forwardedFor = request.headers.get("x-forwarded-for") || "unknown";
  const ipAddress = forwardedFor.split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);

  return createHmac("sha256", process.env.ANALYTICS_HASH_SALT)
    .update(`${day}\n${ipAddress}\n${userAgent}`)
    .digest("hex");
}

function getReferrerHost(referrer, siteHost) {
  if (!referrer) {
    return null;
  }

  try {
    const hostname = new URL(referrer).hostname.slice(0, 255);
    return hostname && hostname !== siteHost ? hostname : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return response(405, { error: "Method not allowed" });
    }

    if (!process.env.DATABASE_URL || !process.env.ANALYTICS_HASH_SALT) {
      console.error("Analytics environment variables are missing");
      return response(503, { error: "Analytics is not configured" });
    }

    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && fetchSite !== "same-origin") {
      return response(403, { error: "Cross-site tracking is not allowed" });
    }

    const userAgent = request.headers.get("user-agent") || "unknown";
    if (botPattern.test(userAgent)) {
      return response(204);
    }

    let event;
    try {
      event = await request.json();
    } catch {
      return response(400, { error: "Invalid JSON" });
    }

    if (typeof event.path !== "string" || !event.path.startsWith("/")) {
      return response(400, { error: "Invalid path" });
    }

    const path = event.path.split("?")[0].slice(0, 500);
    const referrerHost = getReferrerHost(event.referrer, new URL(request.url).hostname);
    const visitorHash = getVisitorHash(request, userAgent);
    const sql = neon(process.env.DATABASE_URL);

    try {
      await sql`
        INSERT INTO analytics_events (visitor_hash, path, referrer_host)
        VALUES (${visitorHash}, ${path}, ${referrerHost})
      `;
      return response(204);
    } catch (error) {
      console.error("Unable to record analytics event", error);
      return response(500, { error: "Unable to record event" });
    }
  },
};
