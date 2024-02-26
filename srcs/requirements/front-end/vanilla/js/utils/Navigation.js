// Assuming we're importing the necessary elements from Router.js
import { routes, navigateTo } from '@utils/Router.js';

export const setupNavigation = () => {
    const parentElement = document.querySelector('#app');
    const navContainer = document.createElement('nav');
    navContainer.classList.add('navigation'); // Add a class for styling if necessary
    parentElement.insertBefore(navContainer, parentElement.firstChild);

    const nav = [
        "/",
	    "/tournament",
	    "/options"
    ];
    //Loop thorugh the nav array and create the links that correspond to the routes
    //if path is included in nav
    Object.entries(routes).forEach(([path, { buttonText }]) => {
        if (nav.includes(path)) {
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
