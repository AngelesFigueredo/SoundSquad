const togglePassword = document.getElementById("toggle-password");
const togglePassword2 = document.getElementById("toggle-password2");
const passwordInput = document.getElementById("pwdInput");
const passwordCheck = document.getElementById("pwdInput2");
const toggleImage1 = document.getElementById("toggle-image1")
const toggleImage2 = document.getElementById("toggle-image2")

togglePassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleImage1.src = '/images/icons/notsee.png';
  } else {
    passwordInput.type = "password";
    toggleImage1.src =
  '/images/icons/see.png';
  }
});
togglePassword2.addEventListener("click", () => {
  if (passwordCheck.type === "password") {
    passwordCheck.type = "text";
    toggleImage2.src =
    '/images/icons/notsee.png';  } else {
    passwordCheck.type = "password";
    toggleImage2.src =
    '/images/icons/see.png';  }
});
