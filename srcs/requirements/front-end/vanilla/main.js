import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'

const navigateTo = url => {
	history.pushState(null, null, url);
	router();
}

const router = async () => {
	const routes = [
		{ path: '/', view: () => console.log('Viewing Homepage') },
		{ path: '/play', view: () => console.log('Viewing Game') },
		{ path: '/tournament', view: () => console.log('Viewing Tournament') },
		{ path: '/options', view: () => console.log('Viewing Options') },
		{ path: '/404', view: () => console.log('Viewing 404 Not Found') }
	];

	// Test each route for potential match
	const potentialMatches = routes.map(route => {
		return {
			route: route,
			isMatch: location.pathname === route.path
		};
	});

	console.log("potentialMatches", potentialMatches);

	let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

	if (!match) {
		match = {
			route: routes.find(route => route.path === '/404'),
			isMatch: true
		};
		document.pushState(null, null, match.route.path)
	}
	
	console.log("match", match.route.view());
	
	document.querySelector('#counter').innerHTML = match.route.path;
};

window.addEventListener("popstate", router)

// listen for clicks on html elements with nav-link property and navigate to them without refreshing
document.body.addEventListener('click', event => {
	if (event.target.matches('[nav-link]')) {
		event.preventDefault();
		if (event.target.href != document.URL) // only navigate if it goes to a new page
			navigateTo(event.target.href);
	}
});
document.addEventListener('DOMContentLoaded', () => {

	router(); // route to page on load
});

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Vite!</h1>
    <div class="card">
      <button class="fdf" id="counter" type="button">click me!</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
	</p>
	<a href="/" class="navigation-link" nav-link>Home</a>
	<a href="/play" class="navigation-link" nav-link>Play</a>
	<a href="/tournament" class="navigation-link" nav-link>Tournament</a>
	<a href="/options" class="navigation-link" nav-link>Options</a>
	<a href="/404" class="navigation-link" nav-link>404</a>
	</div>
	`

setupCounter(document.querySelector('#counter'))
