
let operations = {
	"fade": ['opacity', 0, 1],
	"slide-virtical": ['height', 0, 'auto'],
	"slide-horizontal": ['width', 0, 'auto'],
	"zoom": ['transform', 'scale(0)', 'scale(1)'],
	"blur": ['filter', 'blur(0)', 'blur(5px)'],
	"brightness": ['filter', 'brightness(100%)', 'brightness(200%)'],
	"rotate": ['transform', 'rotate(0)', 'rotate(360deg)'],
	"skew": ['transform', 'skew(0)', 'skew(30deg)'],
	"translate": ['transform', 'translate(0)', 'translate(100px)'],
	"perspective": ['transform', 'perspective(0)', 'perspective(100px)'],
	"matrix": ['transform', 'matrix(0)', 'matrix(1, 0, 0, 1, 0, 0)'],
	"matrix3d": ['transform', 'matrix3d(0)', 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)'],
	"rotate3d": ['transform', 'rotate3d(0)', 'rotate3d(1, 1, 1, 0deg)'],
	"rotateX": ['transform', 'rotateX(0)', 'rotateX(360deg)'],
	"rotateY": ['transform', 'rotateY(0)', 'rotateY(360deg)'],
	"rotateZ": ['transform', 'rotateZ(0)', 'rotateZ(360deg)'],
};

export const fadeInjava = (element, duration) => {
	let op = 0; // initial opacity
	element.style.opacity = op;
	element.style.display = 'block';
	
	let timer = setInterval(function () {
	  if (op >= 1) clearInterval(timer);
	  element.style.opacity = op;
	  op += 0.02; // adjust for smoother or faster transition
	}, duration / 50); // adjust timing
}

export const fadeOutjava = (element, duration) => {
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

export const transition = async (element, types = [['opacity', 0, 1]], duration = 500) => {
	let seconds = (duration / 1000).toString();
	element.style.transition = ''; // clear transitions
	element.style.transition = `all ${seconds}s ease`;

	// apply initial styles
	types.forEach(([property, startVal]) => {
		element.style[property] = startVal.toString();
	});

	await new Promise(resolve => requestAnimationFrame(resolve)); // wait for the next frame

	// start the transition
	requestAnimationFrame(() => {
		types.forEach(([property, , endVal]) => {
			element.style[property] = endVal.toString();
		});
	});

	// wait for the transition to finish
	await new Promise(resolve => setTimeout(resolve, duration));

	// cleanup
	element.style.transition = '';
};

export const fadeIn = (element, duration = 500, display = 'block') => {
	element.style.display = display; // ensure the element is visible
	transition(element, [
		['opacity', 0, 1],
		['filter', 'blur(10px)', 'blur(0)'],
	], duration);
};

export const fadeOut = (element, duration = 500, remove = false) => {
	transition(element, [
		['opacity', 1, 0],
		['filter', 'blur(0)', 'blur(10px)'],
	], duration).then(() => {
		element.style.display = 'none'; // Hide after transition
		if (remove) {
			element.remove(); // Remove if specified
		}
	});
};

export const slideIn = (element, duration = 500, display = 'block') => {
	element.style.display = display; // ensure the element is visible
	transition(element, [
		['opacity', 0, 1],
		['filter', 'blur(10px)', 'blur(0)'],
		// ['height', 0, element.offsetHeight + 'px'],
	], duration);
};

export const slideOut = (element, duration = 500, remove = false) => {
	transition(element, [
		['opacity', 1, 0],
		['filter', 'blur(0)', 'blur(10px)'],
		['height', element.offsetHeight + 'px', 0],
	], duration).then(() => {
		element.style.display = 'none'; // Hide after transition
		if (remove) {
			element.remove(); // Remove if specified
		}
	});
};

export default { 
	fadeInjava, 
	fadeOutjava,
	fadeIn, 
	fadeOut, 
	slideIn,
	slideOut,
	transition,
};