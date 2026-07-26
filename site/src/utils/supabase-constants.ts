// AI: Central auth storage key constant. Must be shared by all Supabase clients
// (browser, server, admin) so they all read/write the same session cookie.
// Overridable via env var, but the default 'pgonrails-session' is fine for all environments.
export const STORAGE_KEY = process.env.VITE_AUTH_STORAGE_KEY || 'pgonrails-session'
