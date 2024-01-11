import React from 'react';
import ReactDOM from 'react-dom';

import $ from 'jquery'; // Make sure to install jQuery: npm install jquery
import LoginPopup from './LoginPopup'; // Assuming you have a LoginPopup component

const App = () => {
  const handleLoginLinkClick = () => {
    $("#darkLayer").fadeIn();
    $("#loginPopup").fadeIn();
  };

  return (
    <div>
      <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>

      <style>
        {`
          #loginPopup {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            max-width: 400px;
            width: 100%;
            border-radius: 8px;
          }

          #loginPopup h2 {
            color: #333;
          }

          #loginPopup input {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
          }

          #loginPopup input[type="submit"] {
            background-color: #4CAF50;
            color: #fff;
            cursor: pointer;
          }

          #loginPopup input[type="submit"]:hover {
            background-color: #45a049;
          }

          #darkLayer {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            z-index: 9998;
          }
        `}
      </style>

      <div id="darkLayer"></div>

      <h1>Login</h1>

      {/* Check if the user is authenticated */}
      {user.is_authenticated ? (
        <div>
          <p>Welcome {user.username}</p>
          <form method="post" action="{% url 'account:logout' %}">
            {/* Replace csrf_token with the actual CSRF token */}
            <input type="hidden" name="csrfmiddlewaretoken" value="{% csrf_token %}" />
            <button type="submit">Log out</button>
          </form>
          <a href="{% url 'account:friend' %}">Friends</a>
          <a href="{% url 'account:detail' %}">Detail</a>
        </div>
      ) : (
        <div>
          <a href="#" id="loginLink" onClick={handleLoginLinkClick}>
            Log in
          </a>
          <LoginPopup />
        </div>
      )}
    </div>
  );
};

export default App;