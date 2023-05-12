
import("../models/Events.model")
  .then((Event) => {
    const accept = document.querySelector("#accept")


    accept.addEventListener("click", async()=>{
    console.log(await Event.find())
    console.log(accept.value)
})
    
  })
  .catch((error) => {
    console.log(error)
  });

