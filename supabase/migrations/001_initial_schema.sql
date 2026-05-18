-- ============================================================
-- TheVideoJanitors — Initial Schema
-- Apply via: supabase db push  OR  psql against local dev DB
-- ============================================================

-- ── TABLES ──────────────────────────────────────────────────

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('client','editor','admin')),
  region      TEXT NOT NULL DEFAULT 'US' CHECK (region IN ('IN','US')),
  currency    TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('INR','USD')),
  admin_role  TEXT CHECK (admin_role IN ('super_admin','ops_admin','finance_admin')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE client_profiles (
  user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  brand_kit_url        TEXT,
  brand_colors         JSONB DEFAULT '{}',
  content_niches       TEXT[] DEFAULT '{}',
  posting_frequency    TEXT,
  style_preferences    TEXT[] DEFAULT '{}',
  reference_video_url  TEXT,
  onboarding_complete  BOOLEAN DEFAULT false,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE editor_profiles (
  user_id                UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name           TEXT,
  bio                    TEXT,
  specialties            TEXT[] DEFAULT '{}',
  portfolio_links        TEXT[] DEFAULT '{}',
  avg_turnaround_hours   INTEGER DEFAULT 24,
  rating                 NUMERIC(3,2) DEFAULT 5.0,
  completed_count        INTEGER DEFAULT 0,
  max_queue_capacity     INTEGER DEFAULT 5,
  current_queue_count    INTEGER DEFAULT 0,
  accepts_repeat_clients BOOLEAN DEFAULT true,
  bank_details_verified  BOOLEAN DEFAULT false,
  is_active              BOOLEAN DEFAULT true,
  unresponsive_count     INTEGER DEFAULT 0,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subscriptions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                UUID REFERENCES users(id) ON DELETE CASCADE,
  gateway                  TEXT NOT NULL CHECK (gateway IN ('stripe','razorpay')),
  gateway_subscription_id  TEXT,
  gateway_customer_id      TEXT,
  plan                     TEXT NOT NULL CHECK (plan IN ('quick_sweep','deep_clean','full_service')),
  credits_total            INTEGER NOT NULL,
  credits_remaining        INTEGER NOT NULL,
  currency                 TEXT NOT NULL,
  amount_paid              INTEGER NOT NULL,
  renews_at                TIMESTAMPTZ,
  status                   TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','past_due','trialing')),
  created_at               TIMESTAMPTZ DEFAULT now(),
  updated_at               TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  editor_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'pending_match' CHECK (status IN (
                   'pending_match','matched','in_progress','delivered',
                   'in_revision','approved','abandoned'
                 )),
  edit_type      TEXT NOT NULL CHECK (edit_type IN ('basic','standard','premium')),
  credits_cost   INTEGER NOT NULL,
  brief          JSONB NOT NULL DEFAULT '{}',
  footage_url    TEXT,
  footage_type   TEXT CHECK (footage_type IN ('drive_link','dropbox_link')),
  aspect_ratios  TEXT[] DEFAULT '{9:16}',
  revision_round INTEGER DEFAULT 0 CHECK (revision_round <= 3),
  submitted_at   TIMESTAMPTZ DEFAULT now(),
  due_at         TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  approved_at    TIMESTAMPTZ,
  close_after    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_requests_client_id ON requests(client_id);
CREATE INDEX idx_requests_editor_id ON requests(editor_id);
CREATE INDEX idx_requests_status    ON requests(status);

CREATE TABLE deliverables (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      UUID REFERENCES requests(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL DEFAULT 1,
  file_url        TEXT,
  mux_asset_id    TEXT,
  mux_playback_id TEXT,
  submitted_by    UUID REFERENCES users(id),
  submitted_at    TIMESTAMPTZ DEFAULT now(),
  status          TEXT DEFAULT 'processing' CHECK (status IN ('processing','ready','approved'))
);

CREATE INDEX idx_deliverables_request_id ON deliverables(request_id);

CREATE TABLE revision_comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id    UUID REFERENCES deliverables(id) ON DELETE CASCADE,
  timestamp_seconds NUMERIC(10,2),
  comment           TEXT NOT NULL,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID REFERENCES requests(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES users(id),
  body        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  read_at     TIMESTAMPTZ
);

CREATE INDEX idx_messages_request_id ON messages(request_id);

CREATE TABLE editor_payouts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  editor_id     UUID REFERENCES users(id),
  request_id    UUID REFERENCES requests(id),
  amount        INTEGER NOT NULL,
  currency      TEXT NOT NULL,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','failed')),
  payout_method TEXT CHECK (payout_method IN ('stripe_connect','razorpay_payout','manual')),
  paid_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL,
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admin_actions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES users(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id   UUID,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE platform_config (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── TRIGGER: auto-set close_after + delivered_at on delivery ─

CREATE OR REPLACE FUNCTION set_close_after() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.close_after  = now() + INTERVAL '7 days';
    NEW.delivered_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_close_after
BEFORE UPDATE ON requests
FOR EACH ROW EXECUTE FUNCTION set_close_after();

-- ── SEED: platform_config ─────────────────────────────────────

INSERT INTO platform_config (key, value) VALUES
('pricing_usd',       '{"quick_sweep":{"amount":9900,"credits":350},"deep_clean":{"amount":24900,"credits":950},"full_service":{"amount":59900,"credits":2500}}'),
('pricing_inr',       '{"quick_sweep":{"amount":249900,"credits":350},"deep_clean":{"amount":599900,"credits":950},"full_service":{"amount":1399900,"credits":2500}}'),
('credit_packs_usd',  '{"small":{"amount":3300,"credits":100},"medium":{"amount":7500,"credits":250},"large":{"amount":14000,"credits":500}}'),
('credit_packs_inr',  '{"small":{"amount":82500,"credits":100},"medium":{"amount":187500,"credits":250},"large":{"amount":349900,"credits":500}}'),
('edit_costs',        '{"basic":50,"standard":70,"premium":100,"extra_ratio":10}'),
('rules',             '{"max_revisions":3,"auto_close_days":7,"editor_reassign_hours":12,"max_active_requests":2}');

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables      ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_payouts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_config   ENABLE ROW LEVEL SECURITY;

-- Admins bypass all tables
CREATE POLICY admin_bypass_users       ON users             FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_cp          ON client_profiles   FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_ep          ON editor_profiles   FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_subs        ON subscriptions     FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_requests    ON requests          FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_deliverable ON deliverables      FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_revcomments ON revision_comments FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_messages    ON messages          FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_payouts     ON editor_payouts    FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_notifs      ON notifications     FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));
CREATE POLICY admin_bypass_actions     ON admin_actions     FOR ALL USING (EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL));

-- Clients: own data only
CREATE POLICY client_profile  ON client_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY client_subs     ON subscriptions   FOR ALL USING (client_id = auth.uid());
CREATE POLICY client_requests ON requests        FOR ALL USING (client_id = auth.uid());
CREATE POLICY client_notifs   ON notifications   FOR ALL USING (user_id = auth.uid());

-- Editors: assigned requests + own profile + own payouts
CREATE POLICY editor_requests ON requests        FOR SELECT USING (editor_id = auth.uid());
CREATE POLICY editor_profile  ON editor_profiles FOR ALL    USING (user_id = auth.uid());
CREATE POLICY editor_payouts  ON editor_payouts  FOR SELECT USING (editor_id = auth.uid());
CREATE POLICY editor_notifs   ON notifications   FOR ALL    USING (user_id = auth.uid());

-- Deliverables: client or assigned editor
CREATE POLICY deliverable_access ON deliverables FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_id
    AND (r.client_id = auth.uid() OR r.editor_id = auth.uid())
  )
);

-- Revision comments: participants only
CREATE POLICY revcomment_access ON revision_comments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM deliverables d
    JOIN requests r ON r.id = d.request_id
    WHERE d.id = deliverable_id
    AND (r.client_id = auth.uid() OR r.editor_id = auth.uid())
  )
);

-- Messages: request participants only
CREATE POLICY msg_access ON messages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM requests r WHERE r.id = request_id
    AND (r.client_id = auth.uid() OR r.editor_id = auth.uid())
  )
);

-- Platform config: read all authenticated, write admin only
CREATE POLICY cfg_read  ON platform_config FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY cfg_write ON platform_config FOR ALL USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.admin_role IS NOT NULL)
);
