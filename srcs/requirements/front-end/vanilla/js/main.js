// import '@css/style.css'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap';
import javascriptLogo from '@public/javascript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from '@utils/counter.js';
import Home from '@views/Home.js';

const navigateTo = url => {
	history.pushState(null, null, url);
	router();
}

const routes = {
	'/': () => Home,
	'/play': () => console.log('Viewing Game', '\"' + window.location.pathname + "\""),
	'/game': () => console.log('Viewing Game', '\"' + window.location.pathname + "\""),
	'/tournament': () => console.log('Viewing Tournament', '\"' + window.location.pathname + "\""),
	'/options': () => console.log('Viewing Options', '\"' + window.location.pathname + "\""),
	'/login': () => console.log('Viewing Login', '\"' + window.location.pathname + "\""),
};

const router = async () => {
	const path = window.location.pathname;
	const view = routes[path] || (() => console.log('Viewing 404 Not Found'));
	
	console.log("match", view());
	
	document.querySelector('#counter').innerHTML = path;
};

// listen for back and forward button clicks and route to the correct page
window.addEventListener("popstate", router)

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

document.querySelector('#app').innerHTML = `
	<div>
		<h1>Hello World!</h1>
		<div class="card">
			<button class="fdf" id="counter" type="button">click me!</button>
		</div>
		<a href="/" class="navigation-link" nav-link>Home</a>
		<a href="/play" class="navigation-link" nav-link>Play</a>
		<a href="/tournament" class="navigation-link" nav-link>Tournament</a>
		<a href="/options" class="navigation-link" nav-link>Options</a>
		<a href="/404" class="navigation-link" nav-link>404</a>
	</div>
	`

setupCounter(document.querySelector('#counter'))
