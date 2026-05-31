update storage.buckets
set allowed_mime_types = ARRAY['image/*']
where id = 'avatars';