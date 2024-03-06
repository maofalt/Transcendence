
export function createElement(tag, attributes, content) {
	const element = document.createElement(tag);

	// add attributes to element
	if (attributes) {
		Object.keys(attributes).forEach(key => {
			element.setAttribute(key, attributes[key]);
		});
	}

	// add html content to element
	if (content) {
		element.innerHTML = content;
	}

	return element;
}