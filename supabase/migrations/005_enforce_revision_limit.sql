-- Enforce max 3 revisions at the database layer.
-- UI gating is bypassable; this trigger is the actual gatekeeper.
CREATE OR REPLACE FUNCTION enforce_revision_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.revision_round > 3 THEN
    RAISE EXCEPTION 'Maximum 3 revisions allowed per request';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_revision_limit
BEFORE UPDATE ON requests
FOR EACH ROW
EXECUTE FUNCTION enforce_revision_limit();
