// data for the api
const key = document.querySelector("#key").value
const concertApiId = document.querySelector("#apiId").value
//data to change once we have the api results
const name = document.querySelector("#name")
const dateAndHour = document.querySelector("#date")
const place = document.querySelector("#place")



axios
    .get(
      `https://app.ticketmaster.com/discovery/v2/events/${concertApiId}.json?apikey=${key}`
    )
    .then((response) => {
        const concert = response.data
        name.value = concert.name
        dateAndHour.value = formatDate(concert.dates.start.localDate)+ " "
        dateAndHour.value += "- " + formatTime(concert.dates.start.localTime)
        place.value = concert._embedded.venues[0].name + ", "
        place.value += concert._embedded.venues[0].city.name
     })
    .catch(error => {
    console.log(error);
});