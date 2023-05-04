const express = require("express");
const router = express.Router();
const axios = require('axios');

/* GET home page */
router.get("/audd", (req, res, next) => {
  res.render("audD/audd");
});

router.post("/song-details", (req, res, next) =>{
  const base64Audio = req.body.audioData;
  
  const data = {
    'api_token': 'c3464647d5ef836d027326a61a5ce3b0',
    'audio': base64Audio,
    'return': 'apple_music,spotify',
  };

  axios({
    method: 'post',
    url: 'https://api.audd.io/',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  .then((response) => {
    const songDetails = response.data.result
    console.log(songDetails, "this is working");
    res.render("audD/song-details", {songDetails});
  })
  .catch((error) =>  {
    console.log(error);
  });
});

module.exports = router;

