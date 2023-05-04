const passwordInput = document.querySelector("#pwdInput");
const uppercaseRequirement = document.querySelector(".uppercase");
const eightCharactersRequirement = document.querySelector(".eight-characters");

passwordInput.addEventListener("keyup", function () {
  const password = passwordInput.value;
  const hasUppercase = /[A-Z]/.test(password);
  const isEightCharactersLong = password.length >= 8;

  if (hasUppercase) {
    uppercaseRequirement.classList.add("hidden");
    uppercaseRequirement.classList.remove("wrong-pwd");
  } else {
    uppercaseRequirement.classList.remove("hidden");
    uppercaseRequirement.classList.add("wrong-pwd");
  }

  if (isEightCharactersLong) {
    eightCharactersRequirement.classList.add("hidden");
    eightCharactersRequirement.classList.remove("wrong-pwd");
  } else {
    eightCharactersRequirement.classList.remove("hidden");
    eightCharactersRequirement.classList.add("wrong-pwd");
  }
});
