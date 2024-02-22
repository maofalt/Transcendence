// main.js
import '@css/style.css';
import { navigateTo } from '@utils/Router.js'; // Assuming navigateTo is exported for use
import { setupNavigation } from '@utils/Navigation.js';
import router from '@utils/Router.js'; // Auto initializes the router

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation(); // Setup navigation links
  router(); // Initialize the router
});
