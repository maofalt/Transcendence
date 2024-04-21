// Router.js
import Tournament from '@views/Tournament.js';
import Game from '@views/Game.js';
import NotFound from '@views/NotFound.js';
import CreateTournament from '@views/CreateTournament.js';
import ProfilePage from '@views/ProfilePage.js';
import SpaceBackground from '@components/SpaceBackground';
import TwoFA from '@views/2fa';
import Signup from '@views/Signup.js';
import EditProfile from '@components/EditProfile';
import HomePage from '@views/HomePage';
import LoginPage from '@views/LoginPage';
import PlayMenu from '@views/PlayMenu';
import displayPopup from "@utils/displayPopup";
import ForgotPassword from '@views/ForgotPassword';
import ResetPassword from '@views/ResetPassword';
import BasicGameV2 from '@views/BasicGameV2';

export const routes = {
	'/': {
		path: '/',
		view: HomePage,
		component: 'home-page',
		title: 'Pongiverse',
		buttonText: 'Home',
	},
	'/space-background': {
		path: '/space-background',
		view: SpaceBackground,
		component: 'space-background',
		title: 'Space Background',
		buttonText: 'Space Background'
	},
	'/play': {
		path: '/play',
		view: Game,
		component: 'game-view',
		title: 'Game',
		buttonText: 'Play',
		requiresLogin: true,
	},
	'/game': {
		path: '/game',
		view: PlayMenu,
		component: 'play-menu',
		title: 'Game',
		buttonText: 'Game'
	},
	'/profile': {
		path: '/profile',
		view: ProfilePage,
		component: 'profile-page',
		title: 'Profile',
		buttonText: 'Profile',
		requiresLogin: true,
	},
	'/edit-profile': {
		path: '/edit-profile',
		view: EditProfile,
		component: 'edit-profile',
		title: 'Edit Profile',
		buttonText: 'Edit Profile',
		requiresLogin: true,
	},
	'/tournament': {
		path: '/tournament',
		view: Tournament,
		title: 'Tournament',
		buttonText: 'Tournament',
		requiresLogin: true,
	},
	'/create-tournament': {
		path: '/create-tournament',
		view: CreateTournament,
		title: 'Tournament Creation',
		buttonText: 'Create Tournament',
		requiresLogin: true,
	},
	'/login': {
		path: '/login',
		view: LoginPage,
		component: 'login-page-v2',
		title: 'Login',
		buttonText: 'Login'
	},
	'/signup': {
		path: '/signup',
		view: Signup,
		component: 'signup-page',
		title: 'Signup',
		buttonText: 'Signup'
	},
	'/2fa': {
		path: '/2fa',
		view: TwoFA,
		component: 'two-fa',
		title: 'Two Factor Authentication',
		buttonText: '2FA'
	},
	'/forgot': {
		path: '/forgot',
		view: ForgotPassword,
		component: 'forgot-password',
		title: 'Forgot Password',
		buttonText: 'Forgot Password'
	},
	'/reset': {
		path: '/reset',
		view: ResetPassword,
		component: 'reset-password',
		title: 'Reset Password',
		buttonText: 'Reset Password',
		requireLogin: true
	},
	'/basic': {
		path: '/basic',
		view: BasicGameV2,
		title: 'Basic Game',
		buttonText: 'Basic',
		component: 'basic-game-v2'
	},
	'/404': {
		path: '/404',
		view: NotFound,
		title: '404 Not Found',
		buttonText: 'Not Found Page'
	}
};

let currentView = null;

export const redirectTo = (url) => {
	history.replaceState(null, null, url);
	router();
};

export const navigateTo = (url) => {
	history.pushState(null, null, url);
	console.log('url: ', url);
	router();
};

let previousView = null;

export const router = async () => {
	const path = window.location.pathname;
	const View = routes[path] || routes['/404'];
	const viewContainer = document.querySelector('#view');

	if (View.requiresLogin && !sessionStorage.getItem('accessToken')) {
		displayPopup(`Please Log In to visit ${View.title} page`, "info");
		redirectTo('/login');
		return;
	}

	if (View.component) {
		if (previousView) {
			// fadeOut(previousView);
		}
		viewContainer.innerHTML = `<${View.component}></${View.component}>`;
		previousView = viewContainer.querySelector(View.component);
		// fadeIn(viewContainer.querySelector(View.component));
	} else {

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

// const background = new SpaceBackground();

// document.querySelector('#app').appendChild(background);
// background.shadowRoot.style.setProperty("position", "absolute");
// background.shadowRoot.style.setProperty("top", "0px");
// background.shadowRoot.style.setProperty("left", "0px");
// background.shadowRoot.style.setProperty("border", "3px red solid");

export default { routes, navigateTo, redirectTo, router };
