import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/',            // root because this is a user site
  plugins: [react()],
  build: {
    outDir: 'docs'      // output files into docs/ so we can serve from main/docs
  }
})