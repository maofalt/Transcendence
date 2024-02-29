
export default `
<div id="darkLayer"></div>

<h1>Login</h1>

<p></p>
<button id="devDbButton">DEV-DB</button>
<p></p>

<a id="loginLink">Log in</a>

<div id="loginPopup">
	<span id="closeLoginPopup">×</span>
	<h2>LOG IN</h2>

	<div id="errorMessage"></div> <!-- This is where the error message will be displayed -->

	<form id="loginForm" action="" method="POST">
		<input name="username" type="text">
		<input name="password" type="password">
		<input type="submit" value="Login">
	</form>

	<a id="forgotPasswordLink">Forgot Password?</a>

	<div id="oneTimeCodeSection" style="display: none;">
		<input name="one_time_code" type="text" placeholder="One-Time Code">
		<button id="submitOneTimeCode">Submit Code</button>
	</div>

	<a id="signupLink">Sign up</a>

	<div id="forgotPasswordModal" style="display: none;">
		<span id="closeForgotPasswordModal">×</span>
		
		<form id="forgotPasswordForm">
			<input name="username_f" type="text" placeholder="Enter your username">
			<button id="sendUrlToEmail" type="button">Send Password Reset Link</button>
		</form>
	</div>
</div>

	<div id="signupPopup" style="display: none;">
		<span id="closeSignupPopup">×</span>
		<h2>Sign Up</h2>

		<div id="signupPopupError"></div> <!-- Add this line -->

		<form id="signupForm" action="" method="POST">
			<p>ID</p>
			<input name="username" type="text" required="">
			<p>PASSWORD
				<span style="color: green; font-size: smaller;">(minimum 8 characters, at least 1 digit, 1 alphabet, different from email and playername)</span>
			</p>
			<input name="password" type="password">
			<p>CONFIRM PASSWORD</p>
			<input name="confirm_password" id="confirmPassword" type="password" required>
			<div id="confirmPasswordError"></div>
			<p>PLAYERNAME</p>
			<input name="playername" type="text" required="">
			<p>EMAIL</p>
			<p>
				<label for="signupEmail"></label>
				<input name="signupEmail" id="signupEmail" type="text" placeholder="example@example.com">
				<button id="sendVerificationCode" type="button">Send Code</button>
			</p>
			<p>
				<label for="access_code"></label>
				<input name="access_code" id="verificationCode" type="text" placeholder="######">
				<button id="verifyCode" type="button">Verify Code</button>
				<span id="successMessage"></span>
			</p>
			<button id="openPrivacyPolicyPopup">Open Privacy Policy</button>

			<div id="privacyPolicyPopup" class="popup-container">
				<button id="closePrivacyPolicyPopup">×</button>
			</div> 
			I agree to the terms and conditions.
			<label for="agreementCheckbox">
				<input type="checkbox" id="agreementCheckbox" required="">
			</label><br><br>
			<input type="submit" value="Sign up" id="signupButton" disabled="">
		</form>
	</div>
`;
