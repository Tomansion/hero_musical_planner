import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  // `npm start` serves the build with `vite preview` (Nixpacks deploys): accept any domain.
  preview: { allowedHosts: true },
})
