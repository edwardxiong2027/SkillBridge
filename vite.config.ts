import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    base: './', // Ensures assets work on GitHub Pages regardless of repo name
    define: {
      // Maps process.env.API_KEY to the VITE_API_KEY environment variable
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  };
});