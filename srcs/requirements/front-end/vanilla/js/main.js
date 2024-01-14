import '@css/style.css'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap';
import javascriptLogo from '@public/javascript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from '@utils/counter.js';
import Home from '@views/Home.js';
import Tournament from '@views/Tournament.js';
import Options from '@views/Options.js';
import Game from '@views/Game.js';
import Login from '@views/Login.js';
import NotFound from '@views/NotFound.js';

const routes = {
	'/': {
		path: '/',
		view: Home,
		title: 'Pongyverse',
		link: 'Home'
	},
	'/play': {
		path: '/play',
		view: Game,
		title: 'Game',
		link: 'Play'
	},
	'/game': {
		path: '/game',
		view: Game,
		title: 'Game',
		link: 'Play'
	},
	'/tournament': {
		path: '/tournament',
		view: Tournament,
		title: 'Tournament',
		link: 'Tournament'
	},
	'/options': {
		path: '/options',
		view: Options,
		title: 'Options',
		link: 'Options'
	},
	'/login': {
		path: '/login',
		view: Login,
		title: 'Login',
		link: 'Login'
	},
	'/404': {
		path: '/404',
		view: NotFound,
		title: '404 Not Found',
		link: 'Not Found Page'
	}
};

const navigateTo = (url) => {
	history.pushState(null, null, url);
	router();
}

const router = async () => {
	const path = window.location.pathname; // get the current path
	const match = routes[Object.keys(routes).find(route => route == path)] || routes['/404']; // find the matching route or use the 404 route
	const view = new match.view(); // create a new view
	
	// set the html of the view element to the html of the view
	document.querySelector('#view').innerHTML = await view.getHtml();
	
	document.title = match.title; // set the title of the page
	
	// document.querySelector('#counter').innerHTML = path;
};

// listen for back and forward button clicks and route to the correct page
window.addEventListener("popstate", router);

document.addEventListener('DOMContentLoaded', () => {
	// listen for clicks on html elements with nav-link property and navigate to them without refreshing
	document.body.addEventListener('click', event => {
		if (event.target.matches('[nav-link]')) {
			event.preventDefault(); // prevent page refresh
			if (event.target.href != document.URL) // only navigate if it goes to a new page
				navigateTo(event.target.href);
		}
	});
	router(); // route to page on load
});

// Create a parent element
const parentElement = document.querySelector('#app');

const elems = [];

// Create individual child elements
// const h1Element = document.createElement('h1');
// h1Element.textContent = 'Hello World!';
// elems.push(h1Element);

const validRoutes = ['/', '/play', '/tournament', '/options', '/login'];
Object.entries(routes).forEach(([route, view]) => {
	if (validRoutes.includes(route)) {
		const link = document.createElement('a');
		link.href = route;
		link.classList.add('nav-link');
		link.setAttribute('nav-link', '');
		link.textContent = view.link;
		elems.push(link);
	}
});

elems.forEach(elem => parentElement.insertBefore(elem, parentElement.querySelector('#view')));


// elems.push(document.querySelector('#counter'));


// setupCounter(document.querySelector('#counter'))
