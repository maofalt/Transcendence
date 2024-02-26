
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

function prop(selector, property, value) {
	const elements = document.querySelectorAll(selector);
	elements.forEach((element) => {
		element[property] = value;
	});
}

export { toggleClass, prop };