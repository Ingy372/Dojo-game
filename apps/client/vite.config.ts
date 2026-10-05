import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so the same build works on Cloudflare Pages and inside
  // the Capacitor iOS/Android apps later.
  base: './',
  build: {
    outDir: 'dist',
    // Phaser is large; keep it in its own file so the game code stays small.
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('node_modules/phaser') ? 'phaser' : undefined),
      },
    },
    chunkSizeWarningLimit: 1500,
  },
});
