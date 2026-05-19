-- ── decrement_editor_queue RPC ───────────────────────────────────────────────
-- Called by DeliveryUploadModal after a successful delivery to keep
-- editor_profiles.current_queue_count accurate.

CREATE OR REPLACE FUNCTION decrement_editor_queue(editor_user_id UUID)
RETURNS void AS $$
  UPDATE editor_profiles
  SET current_queue_count = GREATEST(0, current_queue_count - 1)
  WHERE user_id = editor_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ── payout_rates config ───────────────────────────────────────────────────────
-- What editors earn per edit type, in smallest currency unit (cents / paise).
-- USD: basic=$25, standard=$40, premium=$60
-- INR: basic=₹1500, standard=₹2500, premium=₹4000

INSERT INTO platform_config (key, value) VALUES (
  'payout_rates',
  '{
    "USD": { "basic": 2500, "standard": 4000, "premium": 6000 },
    "INR": { "basic": 150000, "standard": 250000, "premium": 400000 }
  }'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
