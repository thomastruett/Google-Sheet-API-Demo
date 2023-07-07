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
    let googleSheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/1Sp69YxPV2-_NmjjjwaiFCvl59_KeXgLxxHxVingMSK0/values/Sheet1!A1:D?key=AIzaSyCuE37rnuC_y9OlVzhXN3nhjgaPYDK4hcU`;

    fetch(googleSheetsUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.values && Array.isArray(data.values)) {
                let addresses = data.values.map(item => {
                    let title = item[0] ? item[0] : 'Unknown Title';
                    let website = item[1] ? item[1] : 'Unknown Website';
                    let address = item[2] ? item[2] : 'Unknown Address';
                    let year = item[3] ? parseInt(item[3]) : null;
                    return [title, website, address, year];
                });
                geocodeAddresses(addresses);
            } else {
                window.alert('Error: Invalid data format');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            window.alert('Error: ' + error.message);
        });
}


function geocodeAddresses(addresses) {
    addresses.slice(1).forEach(item => {
        const title = item[0] ? item[0] : 'Unknown Title';
        const website = item[1] ? item[1] : 'Unknown Website';
        const address = item[2];
        const year = item[3] ? parseInt(item[3]) : null;

        if (!address) {
            const markerInfo = {
                location: null,
                year: year,
                title: title,
                website: website,
                address: address
            };
            addMarker(markerInfo);
            return;
        }

        if (!storedAddresses[address]) {
            geocoder.geocode({ 'address': address }, function (results, status) {
                if (status === 'OK') {
                    storedAddresses[address] = results[0].geometry.location;
                    sessionStorage.setItem('addresses', JSON.stringify(storedAddresses));
                    const markerInfo = {
                        location: results[0].geometry.location,
                        year: year,
                        title: title,
                        website: website,
                        address: address
                    };
                    addMarker(markerInfo);
                } else if (status === 'ZERO_RESULTS') {
                    console.warn('Geocode was not successful for the following reason: ' + status);
                } else {
                    console.error('Geocode was not successful for the following reason: ' + status);
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        } else {
            const markerInfo = {
                location: storedAddresses[address],
                year: year,
                title: title,
                website: website,
                address: address
            };
            addMarker(markerInfo);
        }
    });
}



function addMarker(markerInfo) {
    const { location, year, title, website, address } = markerInfo;

    let markerIcon;
    const markerPosition = new google.maps.LatLng(location.lat, location.lng);

    // Set marker icon based on the year
    if (year === null) {
        markerIcon = 'assets/frank.png';
    } else if (year >= 2019 && year <= 2023) {
        markerIcon = 'assets/marker-green.svg';
    } else if (year >= 2014 && year <= 2018) {
        markerIcon = 'assets/marker-yellow.svg';
    } else {
        markerIcon = 'assets/marker-red.svg';
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

    // Create the content to be displayed in the info window
    const content = `
        <div class="info">
            <h4>${title}</h4>
            <span><strong>Website</strong> <a href="https://${website}">${website}</a></span>
            <span><strong>Year</strong> ${year}</span>
            <span><strong>Address</strong> ${address}</span>
        </div>
    `;

    // Create an InfoWindow instance for the marker
    const infoWindow = new google.maps.InfoWindow({
        content: content
    });

    // Add a click event listener to the marker
    marker.addListener('click', function () {
        infoWindow.open(map, marker);
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
