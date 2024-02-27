
export default `
<div id="darkLayer"></div>

<h1>Login</h1>

<p></p>
<button id="devDbButton">DEV-DB</button>
<p></p>

<a id="loginLink">Log in</a>

<div id="loginPopup" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); z-index: 9999; width: 300px;">
	<span style="float: right; cursor: pointer;" onclick="console.log('closeLoginPopup()')">x</span>
	<h2>LOG IN</h2>

	<div id="errorMessage" style="color: red;"></div> <!-- This is where the error message will be displayed -->

	<form id="loginForm" action="" method="POST" onsubmit="submitLoginForm(); return false;">
		<input type="hidden" name="csrfmiddlewaretoken" value="f9voPDsD3hLuGcC1mEqvtbk5w4rbVQ2sskwaEr3aenihelt2PGyq3XS2gI8Svsyy">
		<input name="username" type="text">
		<input name="password" type="password">
		<input type="submit" value="Login">
	</form>

	<a id="forgotPasswordLink">Forgot Password?</a>

	<div id="oneTimeCodeSection" style="display: none;">
		<input type="hidden" name="csrfmiddlewaretoken" value="f9voPDsD3hLuGcC1mEqvtbk5w4rbVQ2sskwaEr3aenihelt2PGyq3XS2gI8Svsyy">
		<input name="one_time_code" type="text" placeholder="One-Time Code">
		<button onclick="console.log('submitOneTimeCode(login)')">Submit Code</button>
	</div>

	<a id="signupLink">Sign up</a>

	<div id="forgotPasswordModal" style="display: none;">
		<span style="float: right; cursor: pointer;" onclick="console.log('closeForgotPasswordModal()')">x</span>
		
		<form id="forgotPasswordForm">
			<input type="hidden" name="csrfmiddlewaretoken" value="f9voPDsD3hLuGcC1mEqvtbk5w4rbVQ2sskwaEr3aenihelt2PGyq3XS2gI8Svsyy">
			<input name="username_f" type="text" placeholder="Enter your username" style="width: 200px; margin-right: 5px;">
			<button type="button" onclick="console.log('sendUrlToEmail()')">Send Password Reset Link</button>
		</form>
	</div>

	<div id="signupPopup" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.3); z-index: 9999; width: 300px;">
		<span style="float: right; cursor: pointer;" onclick="console.log('closeSignupPopup()')">x</span>
		<h2>Sign Up</h2>

		<div id="signupPopupError" style="color: red;"></div> <!-- Add this line -->

		<form id="signupForm" action="" method="POST" onsubmit="submitSignupForm(); return false;">
			<input type="hidden" name="csrfmiddlewaretoken" value="f9voPDsD3hLuGcC1mEqvtbk5w4rbVQ2sskwaEr3aenihelt2PGyq3XS2gI8Svsyy">
			<p>ID</p>
			<input name="username" type="text" required="">
			<p>PASSWORD
				<span style="color: green; font-size: smaller;">(minimum 8 characters, at least 1 digit, 1 alphabet, different from email and playername)</span>
			</p>
			<input name="password" type="password">
			<p>CONFIRM PASSWORD</p>
			<input name="confirm_password" id="confirmPassword" type="password" oninput="checkPasswordMatch(); required">
			<div id="confirmPasswordError" style="color: red;"></div>
			<p>PLAYERNAME</p>
			<input name="playername" type="text" required="">
			<p>EMAIL</p>
			<p>
				<label for="signupEmail"></label>
				<input name="signupEmail" id="signupEmail" type="text" placeholder="example@example.com" style="width: 200px; margin-right: 5px;">
				<button type="button" onclick="console.log('sendVerificationCode()')">Send Code</button>
			</p>
			<p>
				<label for="access_code"></label>
				<input name="access_code" id="verificationCode" type="text" placeholder="######" style="width: 200px; margin-right: 5px;">
				<button type="button" onclick="console.log('verifyCode('signup')')">Verify Code</button>
				<span id="successMessage" style="color: green; margin-top: 5px;"></span>
			</p>
			<button onclick="console.log('openPrivacyPolicyPopup()')">Open Privacy Policy</button>

			<div id="privacyPolicyPopup" class="popup-container">
				<span style="float: right; cursor: pointer;" onclick="console.log('closePrivacyPolicyPopup()')">x</span>
			</div> 
			I agree to the terms and conditions.
			<label for="agreementCheckbox">
				<input type="checkbox" id="agreementCheckbox" required="">
			</label><br><br>
			<input type="submit" value="Sign up" id="signupButton" disabled="">
		</form>
	</div>
</div>
`;
