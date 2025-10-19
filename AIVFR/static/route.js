import { update, showAlert } from "./basePage.js";

//-------------------------------------ROUTE SETUP---------------------------------
//-------Verifying ICAO code--------------

function verifyICAO(code) {
    if (code.length == 4) {
        for (let letter of code) {
            if (!isNaN(letter)) {
                return false;
            }
        }
    } else {
        return false;
    }
    return true;
}

//-------Fetching Airport Details from API------------

async function fetchAirportDetails(code) {
    try {code = code.toUpperCase();} catch (error) {
        showAlert("Invalid ICAO code");
        return null;
    }

    try {
        const response = await fetch("/fetch-airport-details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code }), //sends off the code to the backend
        });

        if (!response.ok) {
            throw new Error("Network response was not ok"); //for non-200 errors
        }

        const data = await response.json();
        return data; //returns the airport details

    } catch (error) {
        showAlert("Error fetching airport details. Please make sure the ICAO code is correct.");
        return null;
    }
}

//-------Departure Airport (ICAO)------------
const departureAirport_code = document.getElementById("departure_code");
const departureAirport_name = document.getElementById("departure_name");

departureAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        departureAirport_name.style.display = "inline"; //make the name div visible
        departureAirport_name.textContent = "..."; //simulate loading

        //validating data
        if (verifyICAO(departureAirport_code.value)) {
            const airportDetails = await fetchAirportDetails(departureAirport_code.value);
            if (airportDetails.country == "GB") { //restrict to UK airports only
                await update("departureAirport_code", departureAirport_code.value.toUpperCase());
                await update("departureAirport_name", airportDetails.name);
                departureAirport_code.style.textTransform = "uppercase";
                departureAirport_name.textContent = airportDetails.name;
            } else  if (airportDetails.country != "GB") {
                showAlert("Only UK aerodromes are supported");
                departureAirport_name.style.display = "none";
            } 
        } else {
            showAlert("Invalid ICAO code");
            departureAirport_name.style.display = "none";
        }
    }
});

//-------Arrival Airport (ICAO)------------

const arrivalAirport_code = document.getElementById("arrival_code");
const arrivalAirport_name = document.getElementById("arrival_name");

arrivalAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        arrivalAirport_name.style.display = "inline";
        arrivalAirport_name.textContent = "...";

        //validating data
        if (verifyICAO(arrivalAirport_code.value)) {
            const airportDetails = await fetchAirportDetails(arrivalAirport_code.value);
            if (airportDetails.country == "GB") {
                await update("destinationAirport_code", arrivalAirport_code.value.toUpperCase());
                await update("destinationAirport_name", airportDetails.name);
                arrivalAirport_code.style.textTransform = "uppercase";
                arrivalAirport_name.textContent = airportDetails.name;
            } else if (airportDetails.country != "GB") {
                showAlert("Only UK aerodromes are supported");
                arrivalAirport_name.style.display = "none";
            }
        } else {
            showAlert("Invalid ICAO code");
            arrivalAirport_name.style.display = "none";
        }
    }
});

//-------Alternate Airport (ICAO)------------
const alternateAirport_code = document.getElementById("alternate_code");
const alternateAirport_name = document.getElementById("alternate_name");

alternateAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        alternateAirport_name.style.display = "inline";
        alternateAirport_name.textContent = "...";

        //validating data
        if (verifyICAO(alternateAirport_code.value)) {
            const airportDetails = await fetchAirportDetails(alternateAirport_code.value);
            if (airportDetails.country == "GB") {
                await update("alternateAirport_code", alternateAirport_code.value.toUpperCase());
                await update("alternateAirport_name", airportDetails.name);
                alternateAirport_code.style.textTransform = "uppercase";
                alternateAirport_name.textContent = airportDetails.name;
            } else if (airportDetails.country != "GB") {
                showAlert("Only UK aerodromes are supported");
                alternateAirport_name.style.display = "none";
            }
        } else {
            showAlert("Invalid ICAO code");
            alternateAirport_name.style.display = "none";
        }
    }
});

//------------------------------ROUTE MAP------------------------------
const mapTilerLogo = document.getElementById("mapTilerLogo");

//getting API keys from backend
fetch('/get-api-keys')
.then(response => response.json())
.then(data => {
    const apiKey = data.openaip;
    const apiKeyMaptiler = data.maptiler;

    //Basemap layer from OpenStreetMap
    const Basemap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>contributors'
    });

    //OpenAIP layer for airspace, airports, navaids, etc.
    const OpenAIP = L.tileLayer(`https://api.tiles.openaip.net/api/data/openaip/{z}/{x}/{y}.png?apiKey=${apiKey}`, {
    maxZoom: 18,
    attribution: '<a href="https://www.openaip.net/">OpenAIP Data</a>(<a href="https://creativecommons.org/licenses/by-nc/4.0/">CC-BY-NC 4.0</a>)'
    });

    //satellite map from mapTiler
    const Satellite = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${apiKeyMaptiler}`, {
    maxZoom: 19,
    attribution: ` &copy; <a href="https://www.maptiler.com">maptiler</a>`
    });
    //finding the Basemap style from settings
    fetch('/get-settings')
    .then(response => response.json())
    .then(settingsData => {
        const mapStyle = settingsData.map_style;
        if (mapStyle == 'normal') {
            mapTilerLogo.style.display = "none";
            //crafting the map
            const map = L.map('routeMAP', { 
            center: [51.505, -0.09], //Initial center coords (set to London)
            zoom: 9,
            layers: [Basemap, OpenAIP]
        });
        } else if (mapStyle == 'satellite') {
            mapTilerLogo.style.display = "inline";
            //crafting the map
            const map = L.map('routeMAP', { 
            center: [51.505, -0.09], //Initial center coords (set to London)
            zoom: 9,
            layers: [Satellite, OpenAIP]
        });
        }
    })

.catch(error => {
    console.error('Error fetching API key:', error);
    showAlert('Error fetching map data. Please try again later.');
    });
});