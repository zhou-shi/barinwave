interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // [TAMBAHAN] Izinkan akses string dinamis
  [key: string]: any; 
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __BRAINWAVE_ENV__: any; // Biarkan any agar fleksibel
}