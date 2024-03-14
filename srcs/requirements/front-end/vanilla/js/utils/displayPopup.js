import InfoPopup from "@components/InfoPopup.js";

export const displayPopup = () => {
	let info = document.querySelector("#info");
	info.style.display = "block";
	// let info = new InfoPopup({content: "You have successfully signed up!"});
}