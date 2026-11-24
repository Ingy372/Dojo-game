import { defineConfig } from 'vite';

// The live link is safe for players (Grok playtest Nov 23, C1): Cloudflare builds `main` with
// WORKERS_CI_BRANCH=main, and that build switches the test screens and test links off, the same as
// `npm run build:beta`. Preview links (other branches) and local runs keep them for testing.
const LIVE = process.env.WORKERS_CI_BRANCH === 'main';

export default defineConfig({
  ...(LIVE ? { mode: 'beta' } : {}),
  // Relative paths so the same build works on Cloudflare Pages and inside
  // the Capacitor iOS/Android apps later.
  base: './',
  // Files the game loads as they are (packed art, the app manifest) live in the
  // repository's assets/ folder. Packed art is made by tools/art-import/.
  publicDir: '../../assets',
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
