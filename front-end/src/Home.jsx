// import { useEffect, useState } from 'react';
import useFetch from './useFetch';
import PageCards from './PageCards';

const Home = ({ jsonUrl }) => {
	const title = 'Pongscendence Ballz'
	const subtitle = 'A simple experiment with Three.js'
	// const [clicks, setClicks] = useState(0);

	// const handleClick = (name, e) => {
	// 	setClicks(clicks + 1);
	// 	console.log('clicked ' + clicks + ' times');
	// 	console.log('name: ' + name);
	// 	console.log('event information: ', e.target);
	// }

	// const handleDelete = (id) => {
	// 	console.log('handleDelete called with id: ' + id);
	// 	const newPages = pages.filter(page => page.id !== id);
	// 	setPages(newPages);
	// }

	// const handleAdd = (name) => {
	// 	console.log('handleAdd called with name: ' + name);
	// 	const newPages = [...pages, {name: name, id: Math.random()}];
	// 	setPages(newPages);
	// }

	
	const { data, error, isLoading } = useFetch(jsonUrl);
	
	// console.log("in Home:", "pages: " + data + ", error: " + error + ", loading: " + isLoading);
	// console.log(data);

	return (
		<div>
			<h1 className='title'>{ title }</h1>
			<h2 className='subtitle'>{ subtitle }</h2>
			{ error && <h1 className="errorMsg">Error: { error.message }</h1> }
			{ isLoading && <div>Loading...</div> }
			{ data && <PageCards jsonUrl={jsonUrl} cards={data}/> }
		</div>
	);
}

export default Home;