import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import useFetch from './useFetch';
import useAxios from './useAxios';
import PageCards from './PageCards';
import '../css-srcs/home.css'

const Home = ({ jsonUrl }) => {
	const play = 'PLAY'
	const profile = 'PROFILE'
	const options = 'OPTIONS'

	return (
		<div className="homepage">
			<div className="menu">
				<Link to="/game"><h1 className='menuItem play'>{ play }</h1></Link>
				<Link to="/profile"><h1 className='menuItem profile'>{ profile }</h1></Link>
				<Link to="/options"><h1 className='menuItem options'>{ options }</h1></Link>
			</div>
		</div>
	);
}

export default Home;