
let operations = {
	"fade": ['opacity', 0, 1],
	"slide-virtical": ['height', 0, 'auto'],
	"slide-horizontal": ['width', 0, 'auto'],
	"zoom": ['transform', 'scale(0)', 'scale(1)'],
	"blur": ['filter', 'blur(0)', 'blur(5px)'], 
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

export const transition = async (element, types = [['opacity', 0, 1]],  duration = 500) => {	
	let seconds = (duration / 1000).toString();
	
	element.style.setProperty('transition', `all ${seconds}s ease`);
	
	let [ property, startVal, endVal ] = types[0];

	types.forEach((type) => {
		[ property, startVal, endVal ] = type;
		element.style.setProperty(property, startVal);
	});
	
	setTimeout(() => {
		types.forEach((type) => {
			[ property, startVal, endVal ] = type;
			element.style.setProperty(property, endVal);
		});
	}, 10); // 10ms delay to allow the DOM to update

	await new Promise((resolve) => setTimeout(resolve, duration)); // delay to allow the transition to finish
	element.style.removeProperty('transition');
}

export const fadeIn = (element, duration = 500, display = '') => {
	element.style.display = display; // reset the display property to its default value
	transition(element, [
		['opacity', 0, 1], 
		// ['height', 'auto', 0],
		// ['transform', 'scale(0)', 'scale(1)'],
	], duration);
}

export const fadeOut = (element, duration = 500, remove = false) => {
	transition(element, [
		['opacity', 1, 0],
		// ['height', 0, 'auto'], 
	], duration);
	setTimeout(() => {
		element.style.display = 'none'; // hide the element after the transition is done
		if (remove) {
			element.remove();
		}
	}, duration); // delay to allow the transition to finish
}

export default { 
	fadeInjava, 
	fadeOutjava,
	fadeIn, 
	fadeOut, 
	transition,
};