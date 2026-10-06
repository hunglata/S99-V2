import { defineConfig } from 'vite';
import { safexTransform } from 'vite-plugin-safex-transform';

export default defineConfig({
  define: {
    'process.env': {},
    'import.meta.env.BUILD_TIME': JSON.stringify(new Date().toLocaleString('vi-VN', { hour12: false })),
  },
  publicDir: 'res',
  resolve: {
    alias: {
      box2d: '@safe-engine/sdl/lib/physics/box2d.js',
      sdl3: '@safe-engine/sdl/lib/sdl3.js',
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    target: 'es2020',
  },
  optimizeDeps: {
    exclude: ['@safe-engine/sdl'],
  },
  server: { port: 8098 },
  plugins: [safexTransform()],
});
