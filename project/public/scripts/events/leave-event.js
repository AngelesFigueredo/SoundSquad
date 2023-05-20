const leaveBtn = document.querySelector(".leave")
const popUp = document.querySelector(".pop-up")
const no = document.querySelector(".no")


leaveBtn.addEventListener("click", ()=>{
    popUp.removeAttribute("hidden")
})

no.addEventListener("click", ()=>{
    popUp.setAttribute("hidden", true)
})


const deleteBtn = document.querySelector(".delete")
const popUpDelete = document.querySelector(".pop-up-delete")

const noDelete = document.querySelector(".no-delete")
deleteBtn.addEventListener("click", ()=>{
    popUpDelete.removeAttribute("hidden")
})
noDelete.addEventListener("click", ()=>{
    popUpDelete.setAttribute("hidden", true)
})