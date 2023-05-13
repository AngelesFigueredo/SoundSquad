const express = require("express");
const router = express.Router();
const axios = require("axios");

/* GET home page */
router.get("/audd", (req, res, next) => {
  res.render("audD/audd", { session: req.session });
});

router.post("/song-details", (req, res, next) => {
  const base64Audio = req.body.audioData;
  const data = {
    api_token: "c3464647d5ef836d027326a61a5ce3b0",
    audio: base64Audio,
    return: "apple_music,spotify",
  };
  axios({
    method: "post",
    url: "https://api.audd.io/",
    data: data,
    headers: { "Content-Type": "multipart/form-data" },
  })
  .then((response) => {
    const songDetails = response.data.result;
    // console.log(songDetails, "this is working");
    res.render("audD/song-details", { songDetails, session: req.session });
  })
  .catch((error) => {
    console.log(error);
  });
});

router.post("/concerts-audd", (req, res, next) => {
  const tmApiKey = process.env.TICKET_CONSUMER_KEY;
  const artistName = req.body.artist;
  let foundConcerts = undefined
  axios.get(`https://app.ticketmaster.com/discovery/v2/events.json?apikey=${tmApiKey}&keyword=${artistName}`)
  .then(response => {
      if(response.data && response.data._embedded){
        const events = response.data._embedded.events;
         foundConcerts = events.filter(event => event.name.includes(artistName));
        console.log(foundConcerts[0])
        // const foundConcerts= response.data._embedded.events; //→Esto en caso de que queramos que se muestren 
        // //conciertos relacionados aunque no sean del artista
      }
      res.render("audD/concerts", {foundConcerts})  
    

    
    
  })
  .catch(error => {
    console.log(error);
  });
});
module.exports = router;

