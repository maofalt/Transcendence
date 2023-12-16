import { Link } from "react-router-dom";
import styles from './Navbar.module.css'

const Navbar = () => {
	return (
		<nav className="navbar">
			<h1>Welcome To happy happy!</h1>
			<div className="links">
				<Link to="/">Home</Link>
				<Link to="/create">New Blog</Link>
			</div>
		</nav>
	);
}

export default Navbar;