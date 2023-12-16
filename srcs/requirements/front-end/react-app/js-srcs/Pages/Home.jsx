import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
// import useFetch from '../utils/useFetch.js';
// import useAxios from '../utils/useAxios.js';
// import PageCards from '../utils/PageCards.js';
import './Home.css'

const Home = ({ jsonUrl }) => {
	const play = 'PLAY'
	const profile = 'PROFILE'
	const options = 'OPTIONS'

	return (
		<div className="homepage">
			<div className="menu">
				<div className="menu-item play">
					<object className="rhombus left" type="image/svg+xml" data="assets/RhombusLeft.svg">Your browser does not support SVG</object>
					<Link to="/game"><h1>{ play }</h1></Link>
					<object className="rhombus right" type="image/svg+xml" data="assets/RhombusRight.svg">Your browser does not support SVG</object>
				</div>
				<div className="menu-item profile">
					<object className="rhombus left" type="image/svg+xml" data="assets/RhombusLeft.svg">Your browser does not support SVG</object>
					<Link to="/profile"><h1>{ profile }</h1></Link>
					<object className="rhombus right" type="image/svg+xml" data="assets/RhombusRight.svg">Your browser does not support SVG</object>
				</div>
				<div className="menu-item options">
					<object className="rhombus left" type="image/svg+xml" data="assets/RhombusLeft.svg">Your browser does not support SVG</object>
					<Link to="/options"><h1>{ options }</h1></Link>
					<object className="rhombus right" type="image/svg+xml" data="assets/RhombusRight.svg">Your browser does not support SVG</object>
				</div>
			</div>
		</div>
	);
}

export default Home;