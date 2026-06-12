-- Subscription rows are inserted at checkout-open ('trialing') and only flipped
-- to 'active' by the subscription.charged webhook. Abandoned checkouts leave
-- 'trialing' rows behind that can shadow the real subscription in client
-- queries — expire them daily once they are clearly dead.
SELECT cron.schedule(
  'expire-stale-trialing-subscriptions',
  '15 * * * *',
  $$
    DELETE FROM subscriptions
    WHERE status = 'trialing'
      AND created_at < now() - INTERVAL '24 hours';
  $$
);
