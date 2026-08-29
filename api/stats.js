import { timingSafeEqual } from "node:crypto";
import { neon } from "@neondatabase/serverless";

function response(status, body) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isAuthorized(request) {
  const expected = process.env.ANALYTICS_ADMIN_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!expected || !supplied) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length
    && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return response(405, { error: "Method not allowed" });
    }

    if (!isAuthorized(request)) {
      return response(401, { error: "Unauthorized" });
    }

    if (!process.env.DATABASE_URL) {
      return response(503, { error: "Analytics is not configured" });
    }

    const requestUrl = new URL(request.url);
    const requestedDays = Number.parseInt(requestUrl.searchParams.get("days") || "30", 10);
    const days = Math.min(Math.max(requestedDays || 30, 1), 365);
    const sql = neon(process.env.DATABASE_URL);

    try {
      const [overview, daily, pages, referrers] = await sql.transaction([
        sql`
          SELECT
            COUNT(*)::int AS views,
            COUNT(DISTINCT visitor_hash)::int AS unique_visitors
          FROM analytics_events
          WHERE occurred_at >= CURRENT_DATE - (${days}::int - 1)
        `,
        sql`
          WITH date_range AS (
            SELECT generate_series(
              CURRENT_DATE - (${days}::int - 1),
              CURRENT_DATE,
              INTERVAL '1 day'
            )::date AS day
          ), totals AS (
            SELECT
              occurred_at::date AS day,
              COUNT(*)::int AS views,
              COUNT(DISTINCT visitor_hash)::int AS unique_visitors
            FROM analytics_events
            WHERE occurred_at >= CURRENT_DATE - (${days}::int - 1)
            GROUP BY occurred_at::date
          )
          SELECT
            date_range.day,
            COALESCE(totals.views, 0)::int AS views,
            COALESCE(totals.unique_visitors, 0)::int AS unique_visitors
          FROM date_range
          LEFT JOIN totals USING (day)
          ORDER BY date_range.day
        `,
        sql`
          SELECT path, COUNT(*)::int AS views
          FROM analytics_events
          WHERE occurred_at >= CURRENT_DATE - (${days}::int - 1)
          GROUP BY path
          ORDER BY views DESC
          LIMIT 10
        `,
        sql`
          SELECT referrer_host, COUNT(*)::int AS views
          FROM analytics_events
          WHERE occurred_at >= CURRENT_DATE - (${days}::int - 1)
            AND referrer_host IS NOT NULL
          GROUP BY referrer_host
          ORDER BY views DESC
          LIMIT 10
        `,
      ]);

      return response(200, {
        periodDays: days,
        overview: overview[0],
        daily,
        pages,
        referrers,
      });
    } catch (error) {
      console.error("Unable to load analytics", error);
      return response(500, { error: "Unable to load analytics" });
    }
  },
};
