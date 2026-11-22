import { defineConfig } from 'vite';

// Le jeu est publié sur GitHub Pages à l'adresse /hanout/.
export default defineConfig({
  base: './',
  build: { target: 'es2020' },
});
