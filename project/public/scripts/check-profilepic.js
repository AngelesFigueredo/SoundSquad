const picUrl = document.querySelector("#pic-url")
const takenPic = document.querySelector("#taken-pic")
const uploadButton = document.querySelector("#upload-button")
const fileInput = document.querySelector("#image-input")
const tPic = document.querySelector("#t-pic")
const fileInputLabel = document.querySelector(".custom-file-upload")


// In case a picture has been already taken we shouldn't be able to 
// to also upload a picture from our local machine
// if we didn't want to use the picture we have taken we should
// press the "Subir otra imagen" button
console.log(localStorage.getItem("img"))
if(localStorage.getItem("img")){
    console.log("The localStorage is", localStorage.getItem("img")[0])
        picUrl.value = localStorage.getItem("img")
        takenPic.removeAttribute("hidden")
        uploadButton.removeAttribute("hidden")
        fileInput.setAttribute("hidden", true)
        fileInputLabel.setAttribute("hidden", true)
    }
uploadButton.addEventListener("click", (event)=>{
    event.preventDefault();
    localStorage.clear()
    takenPic.setAttribute("hidden", true)
    uploadButton.setAttribute("hidden", true)
    fileInputLabel.removeAttribute("hidden")
})

tPic.addEventListener("click", (event)=>{
    event.preventDefault();
    window.location.href = "/take-photo"
})