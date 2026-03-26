import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => {
  const isSingleFile = process.env.VITE_SINGLEFILE === 'true';

  const plugins = [react()];

  if (isSingleFile) {
    plugins.push(viteSingleFile());
  } else {
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['images/*.png', 'vite.svg'],
        manifest: {
          name: 'Pesach Haggadah',
          short_name: 'Haggadah',
          description: 'Bilingual Passover Haggadah',
          theme_color: '#fdfbf7',
          background_color: '#fdfbf7',
          display: 'standalone',
          icons: [
            {
              src: 'vite.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    );
  }

  return {
    base: process.env.GITHUB_REPOSITORY && !isSingleFile ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : './',
    plugins,
  };
});
