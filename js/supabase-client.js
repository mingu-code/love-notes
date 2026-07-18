// config.js 로드 이후, supabase-js CDN 로드 이후에 포함되어야 함
window.db = window.supabase.createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

const TABLE = 'phrase_lists';

function randomToken(length = 12) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length];
  return out;
}

async function fetchPhraseList(token) {
  const { data, error } = await window.db
    .from(TABLE)
    .select('token, phrases')
    .eq('token', token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function createPhraseList() {
  const token = randomToken();
  const { data, error } = await window.db
    .from(TABLE)
    .insert({ token, phrases: [] })
    .select('token, phrases')
    .single();
  if (error) throw error;
  return data;
}

async function savePhrases(token, phrases) {
  const { error } = await window.db
    .from(TABLE)
    .update({ phrases })
    .eq('token', token);
  if (error) throw error;
}
