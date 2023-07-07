let map;
let geocoder;
let storedAddresses = sessionStorage.getItem('addresses') ? JSON.parse(sessionStorage.getItem('addresses')) : {};

function initMap() {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: -34.397, lng: 150.644}
    });
}

function fetchAddresses() {
    let googleSheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/1Sp69YxPV2-_NmjjjwaiFCvl59_KeXgLxxHxVingMSK0/values/Sheet1!A1:A50?key=AIzaSyCuE37rnuC_y9OlVzhXN3nhjgaPYDK4hcU`;

    fetch(googleSheetsUrl)
        .then(response => response.json())
        .then(data => {
            let addresses = data.values.map(item => item[0]); 
            geocodeAddresses(addresses);
        })
        .catch(error => console.error('Error:', error));
}

function geocodeAddresses(addresses) {
    addresses.forEach(address => {
        if (!storedAddresses[address]) {
            geocoder.geocode({'address': address}, function(results, status) {
                if (status === 'OK') {
                    storedAddresses[address] = results[0].geometry.location;
                    sessionStorage.setItem('addresses', JSON.stringify(storedAddresses));
                    addMarker(results[0].geometry.location);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        } else {
            addMarker(storedAddresses[address]);
        }
    });
}

function addMarker(location) {
    new google.maps.Marker({
        map: map,
        position: location
    });
}

// Initialize map once
initMap();

// Fetch addresses and add markers every 5 seconds
setInterval(fetchAddresses, 5000);
