import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // This repository is published at https://dev-vrats.github.io/myport/.
  base: '/myport/',
  plugins: [react()],
})
