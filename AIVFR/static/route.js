import { update, showAlert } from "./basePage.js";
let map = null;
load_map()
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
        showAlert("Airport not found. Please make sure the ICAO code is correct.");
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

                /*when arrival aerodrome is entered, fetch the coords for departure and
                 arrival for intial route drawing*/
                const departureCoords = await fetchAvCoords(departureAirport_code.value);
                const arrivalCoords = await fetchAvCoords(arrivalAirport_code.value);

                [departureCoords[0], departureCoords[1]] = [departureCoords[1], departureCoords[0]]; //swap the coordinates to give lat-long instead of long-lat (like why tho, OpenAIP ._.)
                [arrivalCoords[0], arrivalCoords[1]] = [arrivalCoords[1], arrivalCoords[0]]; 
                await add_waypoint(departureCoords);
                await add_waypoint(arrivalCoords);

                reload_map();

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

async function load_map() {
    //getting API keys from backend
    fetch('/get-api-keys')
    .then(response => response.json())
    .then(data => {
        const apiKey = data.openaip;
        const apiKeyMaptiler = data.maptiler;
        const apiKeyJawg = data.jawg;

        //Basemap layer from OpenStreetMap
        const Basemap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>contributors'
        });

        //dark mode map from jawg.io
        const Darkmode = L.tileLayer(`https://tile.jawg.io/e292ef5c-3844-4eef-83ad-a14b12e76451/{z}/{x}/{y}{r}.png?access-token=${apiKeyJawg}`, {
        maxZoom: 19,
        attribution: `<a href="https://maplibre.org">MapLibre</a> &copy; <a href="http://www.jawg.io">JawgMaps</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`
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

        //finding the Basemap style from settings, and the route data from route
        fetch('/get-all')
        .then(response => response.json())
        .then(FlightData => {
            const mapStyle = FlightData.settings.map_style;
            const theme = FlightData.settings.theme;
            const route = FlightData.flight.route

            if (mapStyle == 'normal' && theme == 'light') {
                mapTilerLogo.style.display = "none";
                //crafting the map
                 map = L.map('routeMAP', { 
                center: [51.505, -0.09], //Initial center coords (set to London)
                zoom: 9,
                layers: [Basemap, OpenAIP]
            }); const line = L.polyline(route, { color: '#f0F' }).addTo(map);

            } else if (mapStyle == 'normal' && theme == 'dark') {
                mapTilerLogo.style.display = "none";
                //crafting the map
                 map = L.map('routeMAP', { 
                center: [51.505, -0.09], //Initial center coords (set to London)
                zoom: 12,
                layers: [Darkmode, OpenAIP]
            }); const line = L.polyline(route, { color: '#f0F' }).addTo(map);

            } else if (mapStyle == 'satellite') {
                mapTilerLogo.style.display = "inline";
                //crafting the map
                 map = L.map('routeMAP', { 
                center: [51.505, -0.09], //Initial center coords (set to London)
                zoom: 9,
                layers: [Satellite, OpenAIP]
            });const line = L.polyline(route, { color: '#f0F' }).addTo(map);
            }
        })

        .catch(error => {
            console.error('MapCreationError', error);
            showAlert('An error occurred while fetching map data. Please try again later.');
        });
    });

}
//-------------------------------------------ROUTING--------------------------

//------------------------adding a waypoint

async function add_waypoint(waypoint) {
    try {
    const response = await fetch("/add-waypoint", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ waypoint: waypoint }), //sends off the corrdinates to the backend
    });

    if (!response.ok) {
        throw new Error("Network response was not ok"); //for non-200 errors
    }

    } catch (error) {
        showAlert("An error occured whilst adding the waypoint. Please try again.");
        return null;
    }
}

//------------------------adding a city or town as a waypoint
async function add_city(city) {
    //first, check the city is in the cities database
    try {
            const response = await fetch("/get-cityCoords", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ city: city }), //sends off the city to the backend
            });

            if (!response.ok) {
                throw new Error("Network response was not ok"); //for non-200 errors
            }

            const data = await response.json();

            //then, add the city to the route
            await add_waypoint(data);

        } catch (error) {
            showAlert("Error fetching city details. Please make sure the city name is correct.");
            return null;
        }
    }

//-------------Fetching the coords for airport related features-----------

async function fetchAvCoords(point) {
    point = point.toUpperCase()
    try {
    const response = await fetch("/get-avCoords", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: point }), //sends off the code to the backend
    });

    if (!response.ok) {
        throw new Error("Network response was not ok"); //for non-200 errors
    }

    const data = await response.json();
    return data.coordinates; //returns the coordinates

    } catch (error) {
        showAlert("Waypoint not found. Please check the name and location of your waypoint and try again.");
        return null;
    }
}

//----------------Adding an aviation feature as a waypoint

async function add_av(avPoint) {
    try {
        AvCoords = await fetchAvCoords(avPoint);
        } catch (error) {
        showAlert("Waypoint not found. Please check the name and location of your waypoint and try again.");
        return null;
        }
    await add_waypoint(AvCoords);
}

//----------------------Updating map without realoading page


function reload_map() {
    //removes map instance without removing the whole container
    if (map) {
      try {
        map.off(); //detaches any event listeners (i dont have any here anyways)
        map.remove(); //removes the whole contaier
      } catch (error) {
        console.warn("Error removing map during reload:", error);
        showAlert('An error occured. Please reload the page')
      }
      map = null; //container then re innitalized but set to null
    }
    load_map();
} 

//-------------------------Picking a waypoint------------------------

//switching between city/town or an aviation feature:

function updateSettings(key, value) {
        fetch("/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value})
    });
    }

const CityOrTown = document.getElementById('CityOrTown')
const avFeature = document.getElementById('avFeature')
const searchWaypoint = document.getElementById('searchWaypoint')

CityOrTown.addEventListener('click', () => {
    CityOrTown.classList.add('active')
    avFeature.classList.remove('active')
    searchWaypoint.placeholder = 'Enter a City or Town name'
    updateSettings("waypoint_addType", "City/Town")
})

avFeature.addEventListener('click', () => {
    CityOrTown.classList.remove('active')
    avFeature.classList.add('active')
    searchWaypoint.placeholder = 'Enter ICAO code, Navaid or VRP'
    updateSettings("waypoint_addType", 'VRP/NAVAID/Airport')
})
