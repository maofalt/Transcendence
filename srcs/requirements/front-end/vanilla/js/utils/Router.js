// Router.js
import Home from '@views/Home.js';
import Tournament from '@views/Tournament.js';
import Options from '@views/Options.js';
import Game from '@views/Game.js';
import Login from '@views/Login.js';
import NotFound from '@views/NotFound.js';
import CreateTournament from '@views/CreateTournament.js';
import User from '@views/User';
import Design from '@views/Design.js';


export const routes = {
	'/': {
		path: '/',
		view: Home,
		title: 'Pongiverse',
		buttonText: 'Home'
	},
	'/play': {
		path: '/play',
		view: Game,
		title: 'Game',
		buttonText: 'Play'
	},
	'/game': {
		path: '/game',
		view: Game,
		title: 'Game',
		buttonText: 'Play'
	},
	'/tournament': {
		path: '/tournament',
		view: Tournament,
		title: 'Tournament',
		buttonText: 'Tournament'
	},
	'/create-tournament': {
		path: '/create-tournament',
		view: CreateTournament,
		title: 'Tournament Creation',
		buttonText: 'Create Tournament'
	},
	'/options': {
		path: '/options',
		view: Options,
		title: 'Options',
		buttonText: 'Options'
	},
	'/login': {
		path: '/login',
		view: Login,
		title: 'Login',
		buttonText: 'Login'
	},
	'/user': {
		path: '/user',
		view: User,
		title: 'Profile Page',
		buttonText: 'Profile'
	},
	'/design': {
		path: '/design',
		view: Design,
		title: 'Design',
		buttonText: 'Design',
		component: 'design-page'
	},
	'/404': {
		path: '/404',
		view: NotFound,
		title: '404 Not Found',
		buttonText: 'Not Found Page'
	}
};

let currentView = null;

export const navigateTo = (url) => {
  history.pushState(null, null, url);
  console.log('url: ', url);
  router();
};

const router = async () => {
  const path = window.location.pathname;
  const View = routes[path] || routes['/404'];
  const viewContainer = document.querySelector('#view');

  if (View.component) {
	viewContainer.innerHTML = `<${View.component}></${View.component}>`;
  } else {
	console.log('path: ', path);

	if (currentView && currentView.destroy && currentView !== View) {
		currentView.destroy();
	}

	currentView = new View.view();

	document.querySelector('#view').innerHTML = await currentView.getHtml();
	document.title = View.title;
    if (currentView.init) {
        currentView.init();
    }
  }
};

window.addEventListener("popstate", router);

document.addEventListener('DOMContentLoaded', () => {
  router();
});

export default router;
