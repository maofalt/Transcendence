import './Login.css'

const Login = () => {
	return (
		<div className="Login-login">
			<div className="Login-login-form">
				<form>
					<label htmlFor='username' className='visually-hidden'>Username:</label>
					<input type="text" name="username" id='username' placeholder='Username'/>
					<label htmlFor='password' className='visually-hidden'>Password:</label>
					<input type="password" name="password" id='password' placeholder='Password'/>
					<div className='Login-button'><button>Submit</button></div>
				</form>
			</div>
		</div>
	);
}

export default Login;