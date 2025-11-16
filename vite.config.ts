import { defineConfig } from 'vite';
import { getDirname } from '@adonisjs/core/helpers';
import inertia from '@adonisjs/inertia/client';
import react from '@vitejs/plugin-react';
import adonisjs from '@adonisjs/vite/client';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: false } }),
    react(),
    adonisjs({
      entrypoints: ['inertia/app/app.tsx', 'inertia/scss/app.scss'],
      reload: ['resources/views/**/*.edge'],
    }),
    tsconfigPaths(),
  ],
  server: {
    hmr: process.env.NODE_ENV === 'development',
    watch: {
      usePolling: true,
    },
  },
  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/inertia/`,
      '@/': `${getDirname(import.meta.url)}/inertia/`,
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
    preprocessorOptions: {
      scss: {
        api: 'modern', // or "modern"
      },
    },
  },

  optimizeDeps: {
    include: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
  },
});





