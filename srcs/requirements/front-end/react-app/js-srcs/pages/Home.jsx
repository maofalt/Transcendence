import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import GlowText from "../elements/GlowText";
import './Home.css'

const Home = ({ jsonUrl }) => {
	const play = 'PLAY'
	const depre = ' [DEPRECATED]'
	const profile = 'PROFILE'
	const options = 'OPTIONS'
	const login = 'LOGIN'
	const hoverGlow = 'true'
	const rhombus = 'true'

	return (
		<div className="homepage">
			<div className="menu">
				<Link to="/game"><GlowText text={ play + depre } hoverGlow={ hoverGlow } rhombus={ rhombus }/></Link>
				<Link to="/play"><GlowText text={ play } hoverGlow={ hoverGlow } rhombus={ rhombus }/></Link>
				<Link to="/profile"><GlowText text={ profile } hoverGlow={ hoverGlow } rhombus={ rhombus }/></Link>
				<Link to="/options"><GlowText text={ options } hoverGlow={ hoverGlow } rhombus={ rhombus }/></Link>
				<Link to="/login"><GlowText text={ login } hoverGlow={ hoverGlow } rhombus={ rhombus }/></Link>
			</div>
		</div>
	);
}

export default Home;