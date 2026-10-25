import type { CapacitorConfig } from '@capacitor/cli';

// B-WRAP (M8-a): the phone apps wrap the same web build (apps/client/dist).
const config: CapacitorConfig = {
  // PLACEHOLDER app id: Jay picks the real one before any store upload (it can't change after).
  appId: 'com.placeholder.dojoascent',
  appName: 'Dojo Ascent',
  webDir: 'dist',
};

export default config;
