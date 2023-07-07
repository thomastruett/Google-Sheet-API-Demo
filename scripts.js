let map;
let geocoder;
let storedAddresses = sessionStorage.getItem('addresses') ? JSON.parse(sessionStorage.getItem('addresses')) : {};

window.initMap = function() {
    geocoder = new google.maps.Geocoder();
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: -34.397, lng: 150.644}
    });
    bounds = new google.maps.LatLngBounds();
    fetchAddresses();
}

function fetchAddresses() {
    let googleSheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/1Sp69YxPV2-_NmjjjwaiFCvl59_KeXgLxxHxVingMSK0/values/Sheet1!A1:A?key=AIzaSyCuE37rnuC_y9OlVzhXN3nhjgaPYDK4hcU`;

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
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: "https://emoji.slack-edge.com/T0366B7G5/frank/dfe948694de8093c.png"
    });

    // Extend the bounds to include the new marker's position
    bounds.extend(marker.position);

    // Fit the map to the new bounds. This will zoom in/out and pan the map as necessary.
    map.fitBounds(bounds);
}

function loadScript(url, callback) {
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function() {
        callback();
    };
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCuE37rnuC_y9OlVzhXN3nhjgaPYDK4hcU", function() {
    let checkExist = setInterval(function() {
        if (window.google) {
            clearInterval(checkExist);
            initMap();
        }
    }, 100);
});

// Fetch addresses and add markers every 60 seconds
setInterval(fetchAddresses, (1000 * 60));
