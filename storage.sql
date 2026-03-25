-- Insert a new public bucket named 'photos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to the photos bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'photos');

-- Policy: Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload photos" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'photos' AND 
    auth.role() = 'authenticated'
);

-- Policy: Allow users to update their own uploaded photos
CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'photos' AND 
    auth.role() = 'authenticated' AND
    owner = auth.uid()
);

-- Policy: Allow users to delete their own uploaded photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'photos' AND 
    auth.role() = 'authenticated' AND
    owner = auth.uid()
);
