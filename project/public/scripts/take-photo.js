const video = document.querySelector("#video");
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const captureBtn = document.querySelector("#capture-btn");
const repeatBtn = document.querySelector("#repeat-btn");
const submitPhotoBtn = document.querySelector("#submit-photo");
const profilePicInput = document.querySelector("#profile-pic");
const cancelBtn = document.querySelector("#cancel-photo");

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((error) => {
      console.log("Could not access camera: ", error);
    });
}

captureBtn.addEventListener("click", () => {
  event.preventDefault();
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL("image/png");
  const img = document.createElement("img");
  img.src = dataURL;
  console.log(dataURL);
  profilePicInput.parentNode.insertBefore(img, profilePicInput.nextSibling);
});

submitPhotoBtn.addEventListener("click", () => {
  event.preventDefault();
  console.log(dataURL);
});
