const passwordInput = document.querySelector("#pwdInput");
const confirmPasswordInput = document.querySelector("#pwdInput2");
const uppercaseRequirement = document.querySelector(".uppercase");
const lengthRequirement = document.querySelector(".pwd-length");
const checkPasswordMessage = document.querySelector("#pwd-check-message");

passwordInput.addEventListener("keyup", () => {
  const password = passwordInput.value;

  // Check if password contains at least one uppercase letter
  if (/[A-Z]/.test(password)) {
    uppercaseRequirement.classList.add("valid");
    uppercaseRequirement.classList.remove("invalid");
    uppercaseRequirement.innerHTML = "Una letra mayúscula ☑️";
  } else {
    uppercaseRequirement.classList.add("invalid");
    uppercaseRequirement.classList.remove("valid");
    uppercaseRequirement.innerHTML = "Una letra mayúscula ❌";
  }

  // Check if password is at least 8 characters long
  if (password.length >= 8) {
    lengthRequirement.classList.add("valid");
    lengthRequirement.classList.remove("invalid");
    lengthRequirement.innerHTML = "Al menos ocho caracteres ☑️";
  } else {
    lengthRequirement.classList.add("invalid");
    lengthRequirement.classList.remove("valid");
    lengthRequirement.innerHTML = "Al menos ocho caracteres ❌";
  }
});

confirmPasswordInput.addEventListener("keyup", () => {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (confirmPassword === "") {
    checkPasswordMessage.innerHTML = "";
  } else if (password !== confirmPassword) {
    checkPasswordMessage.innerHTML = "Las contraseñas no coinciden";
  } else {
    checkPasswordMessage.innerHTML = "";
  }
});
