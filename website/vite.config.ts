import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import mdx from '@mdx-js/rollup';
import rehypeHighlight from 'rehype-highlight';
import tailwindcss from '@tailwindcss/vite';
import { version as libVersion } from '../package.json';

// https://vite.dev/config/
export default defineConfig({
  define: {
    // version of the react-dot-cursor package, injected at build time
    __LIB_VERSION__: JSON.stringify(libVersion),
  },
  server: {
    host: '0.0.0.0',
    port: 8081,
  },
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        rehypePlugins: [rehypeHighlight],
      }),
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
