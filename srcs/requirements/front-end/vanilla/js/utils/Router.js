// Router.js
import Home from '@views/Home.js';
import Tournament from '@views/Tournament.js';
import Options from '@views/Options.js';
import Game from '@views/Game.js';
import Login from '@views/Login.js';
import NotFound from '@views/NotFound.js';
import ProfilePage from '@views/LoginUserProfile.js';

import User from '@views/User';
import Design from '@views/Design.js';
import BasicGame from '@views/BasicGame.js';
import TwoFactorAuth from '@views/2fa';
import SignupPage from '@components/SignUpPage.js';

export const routes = {
	'/': {
		path: '/',
		component: 'home-page',
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
		component: 'play-menu',
		title: 'Game',
		buttonText: 'Game'
	},
	'/tournament': {
		path: '/tournament',
		view: Tournament,
		title: 'Tournament',
		buttonText: 'Tournament'
	},
	'/options': {
		path: '/options',
		view: Options,
		title: 'Options',
		buttonText: 'Options'
	},
	'/login': {
		path: '/login',
		component: 'login-page-v2',
		title: 'Login',
		buttonText: 'Login'
	},
	'/signup': {
		path: '/signup',
		component: 'signup-page-v2',
		title: 'Signup',
		buttonText: 'Signup'
	},
	'/forgot_password': {
		path: '/forgot_password',
		component: 'forgot-password',
		title: 'Forgot Password',
		buttonText: 'Forgot Password'
	},
	'/2fa': {
		path: '/2fa',
		component: 'two-factor-auth',
		title: 'Two Factor Authentication',
		buttonText: '2FA'
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
	'/basic': {
		path: '/basic',
		view: BasicGame,
		title: 'Basic Game',
		buttonText: 'Basic',
		component: 'basic-game'
	},
	'/404': {
		path: '/404',
		view: NotFound,
		title: '404 Not Found',
		buttonText: 'Not Found Page'
	},
	'/profile': {
		path: '/profile',
		view: ProfilePage,
		title: 'ProfilePage',
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
	viewContainer.innerHTML = `
		<${View.component}></${View.component}>`;
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

export default { routes, navigateTo, router };
