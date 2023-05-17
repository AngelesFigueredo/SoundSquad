const place = {
    longitude: document.querySelector("#longitude").value,
    latitude: document.querySelector("#latitude").value
};
const key = document.querySelector("#map-key").value;

mapboxgl.accessToken = key;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [place.longitude, place.latitude],
    zoom: 14
});

const marker = new mapboxgl.Marker().setLngLat([place.longitude, place.latitude]).addTo(map);

axios.get(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+FF0000(${place.longitude},${place.latitude})/${place.longitude},${place.latitude},14,0/600x400?access_token=${key}`)
    .catch(error => {
        console.error(error);
    });