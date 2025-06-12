import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/tierlist/', // 🛠️ This fixes the blank page issue on GitHub Pages
  plugins: [react()],
})
