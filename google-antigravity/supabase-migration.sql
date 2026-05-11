-- =============================================
-- FIX 1: DATABASE SCHEMA UPDATES
-- =============================================

-- Add missing columns to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_plan text,
  ADD COLUMN IF NOT EXISTS billing_period_start timestamptz;

-- Update plan CHECK constraint to include trial
ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_plan_check;

ALTER TABLE organizations
  ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('trial', 'starter', 'pro', 'business'));

-- Update default plan to trial
ALTER TABLE organizations
  ALTER COLUMN plan SET DEFAULT 'trial';

-- Add is_active to chatbots
ALTER TABLE chatbots
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;


-- =============================================
-- FIX 2: AUTO-CREATE ORG ON SIGNUP (trigger)
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.organizations (
    user_id,
    name,
    plan,
    trial_ends_at,
    trial_plan,
    message_count_this_month,
    billing_period_start
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'company_name', split_part(new.email, '@', 1)),
    'trial',
    now() + interval '7 days',
    COALESCE(new.raw_user_meta_data->>'selected_plan', 'starter'),
    0,
    now()
  )
  ON CONFLICT DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
