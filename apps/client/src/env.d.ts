// Build-time settings Vite puts into the code (B-SAFE: npm run build:beta sets VITE_BETA=1).
interface ImportMeta {
  readonly env: { readonly DEV: boolean; readonly VITE_BETA?: string };
}
