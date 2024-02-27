
// add or remove a class from all elements matching the selector
function toggleClass(selector, className, state) {
	const elements = document.querySelectorAll(selector);
	elements.forEach((element) => {
		// If state is defined, add or remove based on its boolean value
		// If state is undefined, toggle based on the element's current class state
		if (typeof state !== 'undefined') {
			if (state) {
				element.classList.add(className);
			} else {
				element.classList.remove(className);
			}
		} else {
			element.classList.toggle(className);
		}
	});
}

// set property value for all elements matching the selector
function prop(selector, property, value) {
	const elements = document.querySelectorAll(selector);
	elements.forEach((element) => {
		element[property] = value;
	});
}

// add '.in' class after 10ms
function fadeIn(selector) {
	const element = document.querySelector(selector);
	element.classList.add('fade');
	setTimeout(() => element.classList.add('in'), 10); // 10ms delay to allow the DOM to update
}

// remove '.fade' class after the transition is done
function fadeOut(selector) {
	const element = document.querySelector(selector);
	element.classList.remove('in');
	setTimeout(() => element.classList.remove('fade'), 500); // 500ms delay to allow the transition to finish (adjust to match the transition duration in the CSS file)
}


export { toggleClass, prop, fadeIn, fadeOut };