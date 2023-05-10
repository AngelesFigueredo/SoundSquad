const video = document.querySelector("#video");
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const captureBtn = document.querySelector("#capture-btn");
const repeatBtn = document.querySelector("#repeat-btn");
const submitPhotoBtn = document.querySelector("#submit-photo");
const profilePicInput = document.querySelector("#profile-pic");
const cancelBtn = document.querySelector("#cancel-photo");
let imgUrl;

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

captureBtn.addEventListener("click", (event) => {
  event.preventDefault();
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataURL = canvas.toDataURL("image/png");
  const myImg = document.createElement("img");
  myImg.src = dataURL;
  profilePicInput.parentNode.insertBefore(myImg, profilePicInput.nextSibling);
  imgUrl = dataURL;
});

repeatBtn.addEventListener("click", (event) => {
  event.preventDefault();
  imgUrl = null;
  context.clearRect(0, 0, canvas.width, canvas.height);
});

submitPhotoBtn.addEventListener("click", async (event) => {
 
  event.preventDefault();
  if (imgUrl) {
    const formData = new FormData();
    formData.append("file", imgUrl);
    formData.append("upload_preset", "vcpmg7bd"); 
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dioxc2frd/image/upload",
      formData
    );
    console.log("Image uploaded successfully: ", response.data.secure_url);
    imgUrl = response.data.secure_url;
    localStorage.setItem("img", JSON.stringify(imgUrl))
    window.location.replace("/sign-up")
  } else {
    console.log("No image has been upload");
  }
});

cancelBtn.addEventListener("click", (event) => {
  event.preventDefault();
  localStorage.clear()
  window.location.replace("/sign-up")
  context.clearRect(0, 0, canvas.width, canvas.height);
});

