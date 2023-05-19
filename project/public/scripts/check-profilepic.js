const picUrl = document.querySelector("#pic-url")
const takenPic = document.querySelector("#taken-pic")
const uploadButton = document.querySelector("#upload-button")
const fileInput = document.querySelector("#image-input")


// In case a picture has been already taken we shouldn't be able to 
// to also upload a picture from our local machine
// if we didn't want to use the picture we have taken we should
// press the "Subir otra imagen" button
console.log(localStorage.getItem("img"))
if(localStorage.getItem("img")){
        picUrl.value = localStorage.getItem("img")
        takenPic.removeAttribute("hidden")
        uploadButton.removeAttribute("hidden")
        fileInput.setAttribute("hidden", true)
    }
uploadButton.addEventListener("click", ()=>{
    localStorage.clear()
    takenPic.setAttribute("hidden", true)
    uploadButton.setAttribute("hidden", true)
    fileInput.removeAttribute("hidden")
    
})