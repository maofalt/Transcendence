import { getCookie } from "@utils/getCookie";

document.addEventListener("DOMContentLoaded", function() {
  var updateButton = document.getElementById("update-button");
  if (updateButton) {
      updateButton.addEventListener("click", function(event) {
          event.preventDefault();

          var form = document.getElementById("update-form");
          var formData = new FormData(form);

          var xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/user_management/auth/profile_update");
          xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
          xhr.onload = function() {
              if (xhr.status === 200) {
                  var data = JSON.parse(xhr.responseText);
                  if (data.error) {
                      showMessage("error", data.error);
                  } else if (data.success) {
                      showMessage("success", data.success);
                  }
              } else {
                  showMessage("error", "An error occurred. Please try again later.");
              }
          };
          xhr.onerror = function() {
              showMessage("error", "Request failed. Please try again later.");
          };
          xhr.send(formData);
      });
  }
});

function showMessage(type, message) {
  var messagesDiv = document.getElementById("messages");
  if (messagesDiv) {
      messagesDiv.innerHTML = '<ul class="messages"><li class="' + type + '">' + message + '</li></ul>';
  }
}
