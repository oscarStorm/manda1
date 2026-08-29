# Custom analytics setup

## 1. Create the Neon database

Create a Neon project, open its SQL Editor, and run the contents of
`database/schema.sql`.

Copy the pooled connection string from Neon's **Connect** dialog.

## 2. Configure Vercel

Add these environment variables to the Vercel project for Production, Preview,
and Development as appropriate:

- `DATABASE_URL`: the pooled Neon connection string
- `ANALYTICS_HASH_SALT`: a long random secret used to anonymize daily visitors
- `ANALYTICS_ADMIN_TOKEN`: a long random secret used to open the dashboard

Generate the two secrets separately. For example:

```sh
openssl rand -hex 32
```

Redeploy the site after adding the variables.

## 3. View analytics

Open `/analytics/` on the deployed site and enter `ANALYTICS_ADMIN_TOKEN`.
The token is kept in `sessionStorage`, so it is cleared when the browser tab is
closed.

## Metric definitions

- **Page views**: successful page loads recorded by the tracking endpoint.
- **Unique visits**: distinct anonymous visitor hashes. Hashes include the UTC
  date and therefore reset every day; totals over multiple days are
  visitor-days, not permanently tracked individuals.
- Visitors with Do Not Track enabled are not recorded.
- Obvious crawler and automation user agents are ignored.

Raw IP addresses and user-agent strings are used only in memory to calculate the
daily hash. They are not stored in Postgres. Referrers are reduced to hostnames.
