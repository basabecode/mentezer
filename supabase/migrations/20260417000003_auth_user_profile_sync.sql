-- ============================================================
-- Mentezer — Sincronización auth.users -> psychologists
-- Fecha: 2026-04-17
-- Objetivo: reparar cuentas creadas directamente en Supabase Auth
--           y mantener sincronizados los perfiles futuros.
-- ============================================================

CREATE OR REPLACE FUNCTION public.sync_psychologist_profile_from_auth(
  p_user_id UUID,
  p_email TEXT,
  p_user_meta JSONB DEFAULT '{}'::jsonb,
  p_app_meta JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
  v_professional_license TEXT;
  v_specialty TEXT;
  v_country TEXT;
  v_timezone TEXT;
  v_plan TEXT;
  v_account_status TEXT;
  v_is_platform_admin BOOLEAN;
BEGIN
  IF p_user_id IS NULL OR p_email IS NULL THEN
    RETURN;
  END IF;

  v_name := COALESCE(
    NULLIF(BTRIM(COALESCE(p_user_meta ->> 'name', p_user_meta ->> 'full_name', p_user_meta ->> 'display_name')), ''),
    INITCAP(REPLACE(SPLIT_PART(p_email, '@', 1), '.', ' ')),
    'Profesional'
  );

  v_professional_license := NULLIF(BTRIM(COALESCE(
    p_user_meta ->> 'professional_license',
    p_user_meta ->> 'license',
    p_user_meta ->> 'tp'
  )), '');

  v_specialty := NULLIF(BTRIM(COALESCE(
    p_user_meta ->> 'specialty',
    p_user_meta ->> 'speciality'
  )), '');

  v_country := COALESCE(NULLIF(BTRIM(p_user_meta ->> 'country'), ''), 'CO');
  v_timezone := COALESCE(NULLIF(BTRIM(p_user_meta ->> 'timezone'), ''), 'America/Bogota');

  v_plan := LOWER(COALESCE(
    NULLIF(BTRIM(p_user_meta ->> 'plan'), ''),
    NULLIF(BTRIM(p_app_meta ->> 'plan'), ''),
    'trial'
  ));

  IF v_plan NOT IN ('trial', 'starter', 'professional', 'clinic') THEN
    v_plan := 'trial';
  END IF;

  v_account_status := LOWER(COALESCE(
    NULLIF(BTRIM(p_user_meta ->> 'account_status'), ''),
    NULLIF(BTRIM(p_app_meta ->> 'account_status'), ''),
    NULLIF(BTRIM(p_user_meta ->> 'status'), ''),
    'active'
  ));

  IF v_account_status NOT IN ('active', 'suspended', 'pending') THEN
    v_account_status := 'active';
  END IF;

  v_is_platform_admin := LOWER(COALESCE(
    NULLIF(BTRIM(p_app_meta ->> 'role'), ''),
    NULLIF(BTRIM(p_app_meta ->> 'rol'), ''),
    NULLIF(BTRIM(p_user_meta ->> 'role'), ''),
    NULLIF(BTRIM(p_user_meta ->> 'rol'), ''),
    ''
  )) IN ('admin', 'platform_admin', 'superadmin', 'super_admin', 'administrador')
  OR LOWER(COALESCE(
    NULLIF(BTRIM(p_app_meta ->> 'is_platform_admin'), ''),
    NULLIF(BTRIM(p_user_meta ->> 'is_platform_admin'), ''),
    'false'
  )) IN ('true', 't', '1', 'yes', 'si', 'sí');

  INSERT INTO public.psychologists (
    id,
    email,
    name,
    professional_license,
    specialty,
    country,
    timezone,
    plan,
    trial_ends_at,
    google_calendar_connected,
    is_platform_admin,
    account_status
  )
  VALUES (
    p_user_id,
    p_email,
    v_name,
    v_professional_license,
    v_specialty,
    v_country,
    v_timezone,
    v_plan,
    now() + interval '14 days',
    FALSE,
    v_is_platform_admin,
    v_account_status
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_psychologist_profile_from_auth(
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb)
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_created();

-- Backfill de usuarios ya existentes en auth.users que no tengan perfil.
SELECT public.sync_psychologist_profile_from_auth(
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data, '{}'::jsonb),
  COALESCE(au.raw_app_meta_data, '{}'::jsonb)
)
FROM auth.users au
LEFT JOIN public.psychologists p ON p.id = au.id
WHERE p.id IS NULL;
