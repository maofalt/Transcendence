import './GlowText.css';

const GlowText = ({text, hoverGlow}) => {
	const className = hoverGlow ? 'glowOff' : 'glowOn';

	return (
		<div className={className + " glow-text"}>
			<object className="rhombus left" type="image/svg+xml" data="assets/RhombusLeft.svg">Your browser does not support SVG</object>
			<h1 data-text={ text }>{ text }</h1>
			<object className="rhombus right" type="image/svg+xml" data="assets/RhombusRight.svg">Your browser does not support SVG</object>
		</div>
	);
}

export default GlowText;