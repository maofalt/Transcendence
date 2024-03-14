
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

function fadeInjava(element, duration) {
	let op = 0; // initial opacity
	element.style.opacity = op;
	element.style.display = 'block';
	
	let timer = setInterval(function () {
	  if (op >= 1) clearInterval(timer);
	  element.style.opacity = op;
	  op += 0.02; // adjust for smoother or faster transition
	}, duration / 50); // adjust timing
}

function fadeOutjava(element, duration) {
	let op = 1; // initial opacity
	element.style.opacity = op;
  
	let timer = setInterval(function () {
	  if (op <= 0) {
		clearInterval(timer);
		element.style.display = 'none';
	  }
	  element.style.opacity = op;
	  op -= 0.02; // adjust for smoother or faster transition
	}, duration / 50); // adjust timing
}

// add '.in' class after 10ms
function fadeIn(element) {
	element.style.display = ''; // reset the display property to its default value
	element.classList.add('fade');
	setTimeout(() => element.classList.add('in'), 10); // 10ms delay to allow the DOM to update
}

// remove '.fade' class after the transition is done
function fadeOut(element) {
	element.classList.remove('in');
	setTimeout(() => {
		element.classList.remove('fade');
		element.style.display = 'none'; // hide the element after the transition is done
	}, 500); // 500ms delay to allow the transition to finish (adjust to match the transition duration in the CSS file)
}


export { toggleClass, prop, fadeIn, fadeOut, fadeInjava, fadeOutjava};