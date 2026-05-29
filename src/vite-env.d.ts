/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_REAL_CHAT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css";
