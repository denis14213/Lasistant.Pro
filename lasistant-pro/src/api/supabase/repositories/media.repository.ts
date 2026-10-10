import type { MediaRepository } from '../../contracts';
import { getSupabase } from '../client';
import { ensureOk, guard, unwrap } from '../errors';
import { toMediaItem } from '../mappers';
import { BUCKETS, SIGNED_URL_TTL_SECONDS, storagePath } from '../storage';

/**
 * Médiathèque (table « media » et stockage).
 * Images : bucket public « medias » (adresse publique enregistrée dans la fiche).
 * Documents privés : bucket « documents », jamais exposés (lien temporaire à la demande).
 */
export const mediaRepository: MediaRepository = {
  async list() {
    const result = await guard(() =>
      getSupabase().from('media').select('*').order('created_at', { ascending: false }),
    );
    return unwrap(result).map(toMediaItem);
  },

  async update(id, patch) {
    const row = { alt_text: patch.altText, title: patch.title, rights_confirmed: patch.rightsConfirmed };
    const result = await guard(() =>
      getSupabase().from('media').update(row).eq('id', id).select('*').single(),
    );
    return toMediaItem(unwrap(result));
  },

  async add(upload) {
    const supabase = getSupabase();
    const bucket = upload.isPrivate ? BUCKETS.documents : BUCKETS.media;
    const path = storagePath(upload.isPrivate ? 'documents-prives' : 'images', upload.fileName);
    ensureOk(
      await guard(() =>
        supabase.storage.from(bucket).upload(path, upload.file, {
          contentType: upload.file.type || undefined,
          cacheControl: '31536000',
          upsert: false,
        }),
      ),
    );
    const image = upload.isPrivate ? '' : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

    const result = await guard(() =>
      supabase
        .from('media')
        .insert({
          file_name: upload.fileName,
          kind: upload.isPrivate ? 'document' : 'image',
          image,
          storage_path: path,
          title: upload.fileName.replace(/\.[a-z0-9]+$/i, ''),
          size_bytes: upload.file.size,
          width: upload.width,
          height: upload.height,
          is_private: upload.isPrivate,
        })
        .select('*')
        .single(),
    );
    if (result.error) {
      // La fiche n'a pas pu être créée : le fichier déposé ne doit pas rester orphelin.
      await supabase.storage.from(bucket).remove([path]);
    }
    return toMediaItem(unwrap(result));
  },

  async remove(id) {
    const supabase = getSupabase();
    const existing = await guard(() =>
      supabase.from('media').select('storage_path, is_private').eq('id', id).maybeSingle(),
    );
    const item = unwrap(existing);
    ensureOk(await guard(() => supabase.from('media').delete().eq('id', id)));
    if (item.storage_path) {
      await supabase.storage
        .from(item.is_private ? BUCKETS.documents : BUCKETS.media)
        .remove([item.storage_path]);
    }
  },

  async downloadUrl(item) {
    if (!item.isPrivate) return item.image || null;
    const supabase = getSupabase();
    const existing = await guard(() =>
      supabase.from('media').select('storage_path').eq('id', item.id).maybeSingle(),
    );
    const path = existing.data?.storage_path;
    if (!path) return null;
    const signed = await guard(() =>
      supabase.storage
        .from(BUCKETS.documents)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS, { download: item.fileName }),
    );
    return signed.error ? null : signed.data.signedUrl;
  },
};
