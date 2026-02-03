// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // if using React

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // ✅ Listen on all network interfaces
    port: 3000,      // optional: set your preferred port
    open: false      // optional: don't auto-open browser
  }
});