//////////BEFORE EXECUTING THIS CODE DON'T FORGET
// TO INSTALL AXIOS IN YOUR TERMINAL    

const fs = require('fs');

// Read the contents of a file into a Buffer object
const file = fs.readFileSync('src/sample.mp3'); // The song in the sample is Labour by Paris paloma

// Convert the Buffer object to a Base64-encoded string
const base64String = file.toString('base64');
// console.log(base64String
//     )

const axios = require('axios')


var data = {
    'api_token': 'c3464647d5ef836d027326a61a5ce3b0',
    'audio': base64String,
    'return': 'apple_music,spotify',
};

axios({
    method: 'post',
    url: 'https://api.audd.io/',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
})
.then((response) => {
    console.log(response);
})
.catch((error) =>  {
    console.log(error);
});