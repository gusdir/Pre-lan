/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // On-ramp real (MoonPay) - Fase 1
  readonly VITE_REAL_ONRAMP?: string;
  readonly VITE_MOONPAY_API_KEY?: string;
  readonly VITE_MOONPAY_TEST?: string;
  readonly VITE_ONRAMP_WALLET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
