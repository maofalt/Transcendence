
export function htmlToElement(html) {
	var tempDiv = document.createElement('div');
	tempDiv.innerHTML = html;
	return tempDiv;
}