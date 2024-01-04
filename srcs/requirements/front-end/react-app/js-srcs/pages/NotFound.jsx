import { Link } from "react-router-dom";
import BackButton from "../elements/BackButton";

const NotFound = () => {
	return (
		<div>
			<h1>PAGE NOT FOUND YOU DUMDUM</h1>
			<h3>{"it ok you can go back here --> "}<BackButton></BackButton></h3>
		</div>
	);
}

export default NotFound;