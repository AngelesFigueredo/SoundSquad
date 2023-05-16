const togglePassword = document.getElementById("toggle-password");
const togglePassword2 = document.getElementById("toggle-password2");
const passwordInput = document.getElementById("pwdInput");
const passwordCheck = document.getElementById("pwdInput2");
togglePassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "Hide";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "Show";
  }
});
togglePassword2.addEventListener("click", () => {
  if (passwordCheck.type === "password") {
    passwordCheck.type = "text";
    togglePassword2.textContent = "Hide";
  } else {
    passwordCheck.type = "password";
    togglePassword2.textContent = "Show";
  }
});
