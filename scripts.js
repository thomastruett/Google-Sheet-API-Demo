window.storedAddresses = sessionStorage.getItem('addresses') ? JSON.parse(sessionStorage.getItem('addresses')) : {};

window.initMap = function() {
    window.geocoder = new google.maps.Geocoder();
    window.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: -34.397, lng: 150.644}
    });
    bounds = new google.maps.LatLngBounds();
    fetchAddresses();
}

function fetchAddresses() {
    let googleSheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/1Sp69YxPV2-_NmjjjwaiFCvl59_KeXgLxxHxVingMSK0/values/Sheet1!A1:B?key=AIzaSyCuE37rnuC_y9OlVzhXN3nhjgaPYDK4hcU`;

    fetch(googleSheetsUrl)
        .then(response => response.json())
        .then(data => {
            let addresses = data.values.map(item => [item[0], parseInt(item[1])]);
            geocodeAddresses(addresses);
        })
        .catch(error => console.error('Error:', error));
}


function geocodeAddresses(addresses) {
    addresses.forEach(item => {
        const address = item[0];
        const year = parseInt(item[1]);

        if (!storedAddresses[address]) {
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status === 'OK') {
                    storedAddresses[address] = results[0].geometry.location;
                    sessionStorage.setItem('addresses', JSON.stringify(storedAddresses));
                    addMarker(results[0].geometry.location, year);
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        } else {
            addMarker(storedAddresses[address], year);
        }
    });
}


function addMarker(location, year) {
    let markerIcon;
    const markerPosition = new google.maps.LatLng(location.lat, location.lng);

    // Set marker icon based on the year
    if (year >= 2019 && year <= 2023) {
        markerIcon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    } else if (year >= 2014 && year <= 2018) {
        markerIcon = 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
    } else {
        markerIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }

    const marker = new google.maps.Marker({
        position: markerPosition,
        map: map,
        icon: markerIcon,
        optimized: false
    });

    // Extend the bounds to include the new marker's position
    bounds.extend(marker.getPosition());

    // Fit the map to the new bounds. This will zoom in/out and pan the map as necessary.
    map.fitBounds(bounds);

    // Fallback for custom marker icon
    marker.addListener('iconerror', function() {
        marker.setIcon('https://i.ibb.co/ChQL9FQ/frank.png');
    });
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
