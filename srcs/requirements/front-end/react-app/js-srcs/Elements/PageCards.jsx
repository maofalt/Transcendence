import { Link } from "react-router-dom";
import deletePage from "./Utils/deletePage";

const PageCards = ({ jsonUrl, cards }) => {
	return (
	<>
		{cards.map((card) => (
			<div className="page-card" key={card.id}>
				<Link to={`/blog/${card.id}`} key={card.id}>
					<h2>{ card.title }</h2>
					<p>{ card.author }</p>
				</Link>
				<button onClick={ () => deletePage(jsonUrl + card.id) }>delete page</button>
			</div>
	))}</>);
}

export default PageCards;