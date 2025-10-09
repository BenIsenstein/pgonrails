-- Entities used to manage users' profiles on the "/settings" page


-- RLS policies for the 'avatars' profile pictures bucket within storage.buckets

create policy "universal read on avatars"
on storage.objects
for select
using (
    bucket_id = 'avatars'
);

create policy "anyone can upload a profile picture to a folder with their uid"
on storage.objects
for insert
to authenticated
with check (
    (bucket_id = 'avatars')
    and ((storage.foldername(name))[1] = (select auth.uid())::text)
);

create policy "anyone can update a profile picture in a folder with their uid"
on storage.objects
for update
to authenticated
using (
    (bucket_id = 'avatars')
    and ((storage.foldername(name))[1] = (select auth.uid())::text)
);

create policy "anyone can delete a profile picture in a folder with their uid"
on storage.objects
for delete
to authenticated
using (
    (bucket_id = 'avatars')
    and ((storage.foldername(name))[1] = (select auth.uid())::text)
);

-- Trigger to keep users' avatar image data up-to-date in their raw_user_meta_data in auth.users  

create or replace function private.update_user_avatar_img_name()
    returns trigger
    language plpgsql
    security definer
    set search_path = pg_catalog
    as $$
begin
  if (tg_op = 'DELETE') then
    if (old.bucket_id != 'avatars') then
      return null;
    end if;

    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'avatar_img_name', '',
      'avatar_img_cb', ''
    )
    where id = old.owner;
  elseif (new.bucket_id = 'avatars') then
    update auth.users
    set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object(
      'avatar_img_name', new.name,
      'avatar_img_cb', coalesce(new.user_metadata::jsonb ->> 'cb', '')
    )
    where id = new.owner;
  end if;

  return null;
end;
$$;

alter function private.update_user_avatar_img_name() owner to postgres;

create or replace trigger trg_objects_user_avatar_img_name
after insert or update or delete on storage.objects
for each row execute function private.update_user_avatar_img_name();