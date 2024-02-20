//globalActions.js

window.globalActions = {
    navigateTo: (path)  => {
        history.pushState(null, null, path);
        router();
    }
}

function redirectTo(url) {
    window.Geolocation
}