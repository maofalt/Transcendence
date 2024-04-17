// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8033
  },
  resolve: {
	alias: {
	  '@utils': '/js/utils',
	  '@views': '/js/views',
	  '@css': '/css',
	  '@public': '/public',
	  '@components': '/js/components',
	  '@html': '/js/html',
	  '@assets': '/public/assets',
	  '@images': '/public/assets/images',
	  '@gameLogic': '/js/gameLogic',
	}
  }
});
