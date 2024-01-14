// import '@css/style.css'
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

const navigateTo = url => {
	// history.pushState(null, null, url);
	console.log(url);
	router();
}

const routes = {
	'/': {
		path: '/',
		view: Home,
		title: 'Pongyverse'
	},
	'/play': {
		path: '/play',
		view: Game,
		title: 'Game'
	},
	'/game': {
		path: '/game',
		view: Game,
		title: 'Game'
	},
	'/tournament': {
		path: '/tournament',
		view: Tournament,
		title: 'Tournament'
	},
	'/options': {
		path: '/options',
		view: Options,
		title: 'Options'
	},
	'/login': {
		path: '/login',
		view: Login,	// history.pushState(null, null, url);

		title: 'Login'
	},
	'/404': {
		path: '/404',
		view: NotFound,
		title: '404 Not Found'
	}
};


const router = async (url) => {
	const urlobj = new URL(url); // get the current path
	const path = urlobj.pathname; // get the current path
	const match = routes[Object.keys(routes).find(route => route == path)] || routes['/404']; // find the matching route or use the 404 route
	const view = new match.view(); // create a new view
	
	// set the html of the view element to the html of the view
	document.querySelector('#view').innerHTML = await view.getHtml();
	
	document.title = match.title; // set the title of the page
	history.pushState(null, null, url); // set the url and add to browser history
	
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
				router(event.target.href);
		}
	});
	router(document.URL); // route to page on load
});

// Create a parent element
const parentElement = document.querySelector('#app');

const elems = [];


// Create individual child elements
const h1Element = document.createElement('h1');
h1Element.textContent = 'Hello World!';
elems.push(h1Element);

const validRoutes = ['/', '/play', '/game', '/tournament', '/options', '/login'];
Object.keys(routes).forEach(route => {
	if (validRoutes.includes(route)) {
		const link = document.createElement('a');
		link.href = route;
		link.classList.add('nav-link');
		link.setAttribute('nav-link', '');
		link.textContent = route;
		elems.push(link);
	}
});

const viewElement = document.createElement('div');
viewElement.id = 'view';
elems.push(viewElement);

// elems.push(document.querySelector('#counter'));


elems.forEach(elem => parentElement.appendChild(elem));

// setupCounter(document.querySelector('#counter'))
