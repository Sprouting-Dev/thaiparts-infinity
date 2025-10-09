import React, { useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export default function SupabaseDirectUpload() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const filename = `${crypto.randomUUID()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filename, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (error) throw error;
      const publicUrl = supabase.storage.from('uploads').getPublicUrl(filename).data.publicUrl;
      setUrl(publicUrl);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFile} />
      {loading && <p>Uploading...</p>}
      {url && (
        <div>
          <p>Uploaded:</p>
          <img src={url} alt="uploaded" style={{ maxWidth: 400 }} />
        </div>
      )}
    </div>
  );
}
