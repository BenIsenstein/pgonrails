---
name: add-storage-bucket
description: Create a new Supabase Storage bucket with RLS policies and upload/download patterns
---

# Add Storage Bucket

Create a new Supabase Storage bucket via migration.

## Prerequisites
- Existing bucket example: `avatars` (see `20251007002120_add_avatars_bucket.sql`)
- Storage uses the `storage` schema (managed by Supabase)

## Docs
- https://supabase.com/docs/guides/storage
- https://supabase.com/docs/guides/storage/security/access-control

## Workflow

1. **Create a migration** (see `add-migration` skill):
   ```bash
   cd app && npx supabase migration new add_<bucket_name>_bucket
   ```

2. **Write the migration SQL:**
   ```sql
   insert into storage.buckets (id, name, public)
   values ('<bucket_name>', '<bucket_name>', false)
   on conflict (id) do nothing;

   -- RLS: Authenticated users can upload to their own folder
   create policy "<bucket_name>_insert"
     on storage.objects for insert
     to authenticated
     with check (
       bucket_id = '<bucket_name>'
       and (storage.foldername(name))[1] = auth.uid()::text
     );

   -- RLS: Users can read their own files
   create policy "<bucket_name>_select"
     on storage.objects for select
     to authenticated
     using (
       bucket_id = '<bucket_name>'
       and (storage.foldername(name))[1] = auth.uid()::text
     );

   -- RLS: Users can update their own files
   create policy "<bucket_name>_update"
     on storage.objects for update
     to authenticated
     using (
       bucket_id = '<bucket_name>'
       and (storage.foldername(name))[1] = auth.uid()::text
     );

   -- RLS: Users can delete their own files
   create policy "<bucket_name>_delete"
     on storage.objects for delete
     to authenticated
     using (
       bucket_id = '<bucket_name>'
       and (storage.foldername(name))[1] = auth.uid()::text
     );
   ```

3. **Upload from client:**
   ```tsx
   import { createBrowserClient } from '@/utils/supabase-browser'

   const supabase = createBrowserClient()
   const { error } = await supabase.storage
     .from('<bucket_name>')
     .upload(`${userId}/${fileName}`, file, {
       cacheControl: '3600',
       upsert: true,
     })
   ```

4. **Get public URL (if bucket is public):**
   ```tsx
   const { data } = supabase.storage
     .from('<bucket_name>')
     .getPublicUrl(`${userId}/${fileName}`)
   ```

## Key Files
- `supabase/migrations/20251007002120_add_avatars_bucket.sql` — Reference implementation
- `supabase/migrations/20251007002536_avatars_restrict_mime_type.sql` — Example of restricting file types
- `src/components/settings/upload-avatar.tsx` — Example upload component

## Patterns
- **Folder-per-user:** Use `auth.uid()::text` as the first folder segment for user-scoped isolation
- **MIME restriction:** Add a `with check` clause: `(storage.extension(name) = any(array['jpg','png','webp']))`
- **Public buckets:** Set `public = true` in the insert and add a permissive select policy for `anon`
- **Signed URLs (private buckets):** Use `supabase.storage.from('bucket').createSignedUrl(path, expiresIn)`

## Pitfalls
- `storage.foldername(name)` returns an array — use `[1]` to get the first segment
- Bucket names must be lowercase and can only contain letters, numbers, dots, and hyphens
- If upload returns 403, check RLS policies (not bucket-level settings)
- `upsert: true` overwrites existing files at the same path — use unique names or cache-busters if needed
