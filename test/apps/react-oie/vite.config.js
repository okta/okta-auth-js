import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
// TODD: handle with it's own env module when move to samples folder
// eslint-disable-next-line node/no-extraneous-import
import envModule from '@okta/env';

envModule.setEnvironmentVarsFromTestEnv(__dirname);

const env = {};
// List of environment variables made available to the app
['ISSUER', 'CLIENT_ID'].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  env[key] = process.env[key];
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': env
  },
  server: {
    port: 8080
  },
  build: {
    rollupOptions: {
      plugins: [visualizer({
        filename: 'dist/stats.html',
        gzipSize: true
      })]
    }
  }
});
