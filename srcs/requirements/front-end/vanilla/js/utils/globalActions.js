//globalActions.js
import { setupNavigation} from '@utils/Navigation.js';
import { navigateTo } from './utils/Router.js';


window.globalActions = {
	navigateTo,
    setupNavigation,
}

window.globalActions.setupNavigation();

window.globalActions.navigateTo(window.location.pathname);

export default window.globalActions;