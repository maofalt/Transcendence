// Assuming we're importing the necessary elements from Router.js
import { routes, navigateTo } from '@utils/Router.js';

export const setupNavigation = () => {
    const parentElement = document.querySelector('#app');
    const navContainer = document.createElement('nav');
    navContainer.classList.add('navigation'); // Add a class for styling if necessary
    parentElement.insertBefore(navContainer, parentElement.firstChild);

    Object.entries(routes).forEach(([path, { buttonText }]) => {
        if (path !== '/404') { // Exclude the 404 route
            const link = document.createElement('a');
            link.href = path;
            link.textContent = buttonText;
            link.classList.add('nav-link');
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent the default link behavior
                navigateTo(path); // Use the navigateTo function from Router.js
            });
            navContainer.appendChild(link); // Append the link to the navigation container
        }
    });
};
