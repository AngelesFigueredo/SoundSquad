// data for the api
const key = document.querySelector("#key").value
const concertApiId = document.querySelector("#apiId").value
//data to change once we have the api results
const name = document.querySelector("#name")
const dateAndHour = document.querySelector("#date")
const place = document.querySelector("#place")
const longitude = document.querySelector("#longitude")
const latitude = document.querySelector("#latitude")


axios
    .get(
      `https://app.ticketmaster.com/discovery/v2/events/${concertApiId}.json?apikey=${key}`
    )
    .then((response) => {
        const concert = response.data
        name.innerHTML = concert.name
        dateAndHour.innerHTML = formatDate(concert.dates.start.localDate)+ " "
        dateAndHour.innerHTML += "- " + formatTime(concert.dates.start.localTime)
        place.innerHTML = concert._embedded.venues[0].name + ", "
        place.innerHTML += concert._embedded.venues[0].city.name
        longitude.value = concert._embedded.venues[0].location.longitude
        latitude.value = concert._embedded.venues[0].location.latitude

     })
    .catch(error => {
    console.log(error);
});