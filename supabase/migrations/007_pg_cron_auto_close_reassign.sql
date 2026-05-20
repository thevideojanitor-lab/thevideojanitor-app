-- pg_cron jobs for auto-closing abandoned deliveries and reassigning stale matches.
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Auto-close delivered requests after 7 days (runs hourly at :00)
SELECT cron.schedule(
  'auto-close-abandoned',
  '0 * * * *',
  $$
    UPDATE requests
    SET status = 'abandoned'
    WHERE status = 'delivered'
      AND close_after IS NOT NULL
      AND close_after < now();
  $$
);

-- Reassign requests where editor has been unresponsive for 12h (runs hourly at :30)
SELECT cron.schedule(
  'reassign-unresponsive-editors',
  '30 * * * *',
  $$
    -- Track which editors are being reassigned
    WITH stale AS (
      SELECT DISTINCT editor_id
      FROM requests
      WHERE status IN ('matched', 'in_progress')
        AND updated_at < now() - INTERVAL '12 hours'
        AND editor_id IS NOT NULL
    )
    UPDATE editor_profiles
    SET unresponsive_count = unresponsive_count + 1
    WHERE user_id IN (SELECT editor_id FROM stale);

    -- Deactivate editors with 3+ unresponsive strikes
    UPDATE editor_profiles
    SET is_active = false
    WHERE unresponsive_count >= 3
      AND is_active = true;

    -- Reset stale requests back to pending_match
    UPDATE requests
    SET editor_id = NULL,
        status = 'pending_match',
        updated_at = now()
    WHERE status IN ('matched', 'in_progress')
      AND updated_at < now() - INTERVAL '12 hours'
      AND editor_id IS NOT NULL;
  $$
);
