CREATE TABLE IF NOT EXISTS analytics_events (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    visitor_hash text NOT NULL,
    path text NOT NULL,
    referrer_host text
);

CREATE INDEX IF NOT EXISTS analytics_events_occurred_at_idx
    ON analytics_events (occurred_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_path_occurred_at_idx
    ON analytics_events (path, occurred_at DESC);

CREATE INDEX IF NOT EXISTS analytics_events_visitor_occurred_at_idx
    ON analytics_events (visitor_hash, occurred_at DESC);
