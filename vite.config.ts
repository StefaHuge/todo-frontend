import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module',
        },
        manifest: {
          id: '/',
          name: 'ToDo App',
          short_name: 'ToDo',
          description: 'Мой планировщик задач',
          theme_color: '#2563eb',
          background_color: '#ffffff',
          display: 'standalone',

          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: 'screenshot-wide.png',
              sizes: '1365x768',
              type: 'image/png',
              form_factor: 'wide',
            },
            {
              src: 'screenshot-mobile.png',
              sizes: '1179x2096',
              type: 'image/png',
              form_factor: 'narrow',
            },
          ],
        },
      }),
  ],
})
