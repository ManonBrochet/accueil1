import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path pour le déploiement (laisser '/' si à la racine)
  base: '/',
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy pour contourner les problèmes CORS en développement
      '/api': {
        target: 'https://admin-sdis88.mmi-stdie.fr',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    // Optimisations pour la production
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Mettre à true pour le debug en production si nécessaire
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          axios: ['axios'],
        },
      },
    },
  },
});

