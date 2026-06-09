-- 1. Tighten visitor_events insert policy
DROP POLICY IF EXISTS "Anyone can log a visit" ON public.visitor_events;

CREATE POLICY "Anyone can log a visit"
ON public.visitor_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  session_id IS NOT NULL
  AND length(session_id) BETWEEN 8 AND 128
  AND (path IS NULL OR length(path) <= 512)
  AND (country IS NULL OR length(country) <= 8)
  AND (referrer IS NULL OR length(referrer) <= 1024)
  AND (user_agent IS NULL OR length(user_agent) <= 1024)
);

-- 2. Lock down questions_editor_view to use definer's rights (not invoker)
ALTER VIEW public.questions_editor_view SET (security_invoker = false);
