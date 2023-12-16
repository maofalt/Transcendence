import { Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import GlowText from "../elements/GlowText";
import './Home.css'

const Home = ({ jsonUrl }) => {
	const play = 'PLAY'
	const profile = 'PROFILE'
	const options = 'OPTIONS'
	const hoverGlow = 'true'
	const rhombus = 'true'

	return (
		<div className="homepage">
			<div className="menu">
				<div className="menu-item">
					{/* <object className="rhombus left" type="image/svg+xml" data="assets/RhombusLeft.svg">Your browser does not support SVG</object> */}
					<div className="ban"><Link to="/game"><GlowText text={ play } hoverGlow={ hoverGlow } rhombus={ rhombus }/></Link></div>
					{/* <object className="rhombus right" type="image/svg+xml" data="assets/RhombusRight.svg">Your browser does not support SVG</object> */}
				</div>
				<div className="menu-item">
					{/* <object className="rhombus left" type="image/svg+xml" data="assets/RhombusLeft.svg">Your browser does not support SVG</object> */}
					<Link to="/profile"><GlowText text={ profile } hoverGlow={ hoverGlow } rhombus={ rhombus }/></Link>
					{/* <object className="rhombus right" type="image/svg+xml" data="assets/RhombusRight.svg">Your browser does not support SVG</object> */}
				</div>
				<div className="menu-item">
					{/* <object className="rhombus left" type="image/svg+xml" data="assets/RhombusLeft.svg">Your browser does not support SVG</object> */}
					<Link to="/options"><GlowText text={ options } hoverGlow={ hoverGlow } rhombus={ rhombus }/></Link>
					{/* <object className="rhombus right" type="image/svg+xml" data="assets/RhombusRight.svg">Your browser does not support SVG</object> */}
				</div>
			</div>
		</div>
	);
}

export default Home;