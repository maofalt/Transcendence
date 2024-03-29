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
	  '@assets': '/js/assets',
	  '@images': '/js/assets/images',
	  '@gameLogic': '/js/gameLogic',
	}
  }
});
