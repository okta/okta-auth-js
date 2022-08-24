import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import oktaEnv from '@okta/env';

const env = {};
oktaEnv.setEnvironmentVarsFromTestEnv(__dirname);
// List of environment variables made available to the app
['ISSUER', 'SPA_CLIENT_ID'].forEach((key) => {
  if (!process.env[key]) {
    console.warn(`Environment variable ${key} should be set for development. See README.md`);
  }
  env[key] = process.env[key];
});

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': env
  },
  server: {
    port: 8080,
  },
  build: {
    sourcemap: true,
    polyfillModulePreload: false,
    rollupOptions: {
      input: {
        authn: fileURLToPath(new URL('./authn.html', import.meta.url)),
      },
      plugins: [visualizer({
        filename: 'dist/stats.authn.html',
        gzipSize: true,
      })]
    }
  }
});
