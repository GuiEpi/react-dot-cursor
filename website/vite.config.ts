import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import mdx from '@mdx-js/rollup';
import rehypeHighlight from 'rehype-highlight';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
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
