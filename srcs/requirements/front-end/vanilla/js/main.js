// main.js
import '@css/style.css';
import { navigateTo } from '@utils/Router.js';
import { setupNavigation } from '@utils/Navigation.js';
import { router } from '@utils/Router.js'; // Auto initializes the router

document.addEventListener('DOMContentLoaded', () => {
//   setupNavigation(); // Setup navigation links
  router(); // Initialize the router
});

// initial call to set up the refresh token loop
renewToken();
