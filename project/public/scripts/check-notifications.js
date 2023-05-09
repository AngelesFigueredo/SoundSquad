window.addEventListener("load", function () {
  const links = document.querySelectorAll(".new-notification");
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function (event) {
      this.classList.remove("new-notification");
    });
  }
});
