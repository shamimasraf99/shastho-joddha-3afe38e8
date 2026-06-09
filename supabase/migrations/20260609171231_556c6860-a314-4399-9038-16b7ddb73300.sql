
CREATE TABLE public.visitor_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  path TEXT,
  country TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitor_events_created_at ON public.visitor_events (created_at DESC);
CREATE INDEX idx_visitor_events_country ON public.visitor_events (country);
CREATE INDEX idx_visitor_events_session ON public.visitor_events (session_id);

GRANT INSERT ON public.visitor_events TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.visitor_events_id_seq TO anon, authenticated;
GRANT SELECT ON public.visitor_events TO authenticated;
GRANT ALL ON public.visitor_events TO service_role;

ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log a visit"
  ON public.visitor_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read visits"
  ON public.visitor_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
