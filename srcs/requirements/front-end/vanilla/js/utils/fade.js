
// add '.in' class after 10ms
function fadeIn(element) {
	element.classList.add('fade');
	setTimeout(() => element.classList.add('in'), 10); // 10ms delay to allow the DOM to update
}

// remove '.fade' class after the transition is done
function fadeOut(element) {
	element.classList.remove('in');
	setTimeout(() => element.classList.remove('fade'), 500); // 500ms delay to allow the transition to finish (adjust to match the transition duration in the CSS file)
}
