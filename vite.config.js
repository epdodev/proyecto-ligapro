import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        tablero: resolve(__dirname, 'tablero.html'),
        posiciones: resolve(__dirname, 'posiciones.html'),
        clubes: resolve(__dirname, 'clubes.html'),
        uniformes: resolve(__dirname, 'uniformes.html'),
        estadios: resolve(__dirname, 'estadios.html'),
        consola: resolve(__dirname, 'consola.html'),
        consolaAltoContraste: resolve(__dirname, 'consola-alto-contraste.html'),
        consolaTablet: resolve(__dirname, 'consola-tablet.html'),
        login: resolve(__dirname, 'login.html')
      }
    }
  }
});
