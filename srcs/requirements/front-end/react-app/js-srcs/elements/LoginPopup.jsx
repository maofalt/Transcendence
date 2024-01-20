import React, { useState } from 'react';
import $ from 'jquery'; // Make sure to install jQuery: npm install jquery

const LoginPopup = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const closeLoginPopup = () => {
    $("#darkLayer").fadeOut();
    $("#loginPopup").fadeOut();
    console.log('closeLoginPopup() called\n\n');
  };

  const submitLoginForm = () => {
    $.ajax({
      url: 'https://localhost:9443/api/user_management/auth/login',
      type: 'POST',
      data: $('#loginForm').serialize(),
      headers: { "X-CSRFToken": "{{ csrf_token }}" },
      success: function (data) {
        console.log('Login successful:', data);
        closeLoginPopup();
        window.location.href = '';
      },
      error: function () {
        console.log('An error occurred while processing your request.');
      }  
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div id="loginPopup" style={{ display: 'none', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)', zIndex: '9999' }}>
      <span style={{ float: 'right', cursor: 'pointer' }} onClick={closeLoginPopup}>&times;</span>
      <h2>LOG IN</h2>

      <form id="loginForm" action="" method="POST" onSubmit={(e) => { e.preventDefault(); submitLoginForm(); }}>
        {/* Replace csrf_token with the actual CSRF token */}
        <input name="username" type="text" value={formData.username} onChange={handleInputChange} />
        <input name="password" type="password" value={formData.password} onChange={handleInputChange} />
        <input type="submit" value="Login" />
      </form>
      
      <a href="#" id="signupLink" onClick={() => { closeLoginPopup(); /* additional logic */ }}>Sign up</a>
      {/* Include the equivalent of 'signup.html' here */}
    </div>
  );
};

export default LoginPopup;