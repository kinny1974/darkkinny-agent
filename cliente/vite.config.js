import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3099, // Opcional: define el puerto para el servidor de desarrollo de Vite
  },
});