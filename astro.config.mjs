import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  integrations: [
    react({
      include: ['**/react/**/*'],
    }),
    sitemap(),
  ],
  site: 'https://mtg.syowa.workers.dev',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    define: {
      'process.env.NEXT_PUBLIC_SITE_URL': JSON.stringify(process.env.NEXT_PUBLIC_SITE_URL || 'https://mtg.syowa.workers.dev'),
    },
    optimizeDeps: {
      include: ['react', 'react-dom/client'],
    },
  },
});
