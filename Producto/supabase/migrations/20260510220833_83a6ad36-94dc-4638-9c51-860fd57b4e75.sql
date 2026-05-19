-- Recycling points table
CREATE TABLE public.recycling_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  materials TEXT[] NOT NULL DEFAULT '{}',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recycling_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recycling points are viewable by everyone"
ON public.recycling_points FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create recycling points"
ON public.recycling_points FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recycling points"
ON public.recycling_points FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recycling points"
ON public.recycling_points FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_recycling_points_updated_at
BEFORE UPDATE ON public.recycling_points
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public) VALUES ('recycling-photos', 'recycling-photos', true);

CREATE POLICY "Recycling photos are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'recycling-photos');

CREATE POLICY "Authenticated users can upload recycling photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recycling-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own recycling photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'recycling-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own recycling photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'recycling-photos' AND auth.uid()::text = (storage.foldername(name))[1]);