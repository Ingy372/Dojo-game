import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths so the same build works on Cloudflare Pages and inside
  // the Capacitor iOS/Android apps later.
  base: './',
  // When this build was made (shown small on the title screen), so it's easy to check
  // whether a phone has the newest version.
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
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
