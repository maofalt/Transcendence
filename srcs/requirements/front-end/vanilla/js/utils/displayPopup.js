
export const displayPopup = (message, infoType) => {
	let info = document.querySelector("#info");
	info.setAttribute('message', message);
	info.setAttribute('type', infoType);
	info.style.display = "block";
}