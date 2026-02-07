import { update, showAlert, prompt } from "./basePage.js";
import LatLon from 'https://cdn.jsdelivr.net/npm/geodesy@2.4.0/latlon-spherical.min.js';

await updateSettings("current_page", "/route");

let map = null;

(async () => {
    await load_map();
})();

const response = await fetch('/time-distance');
if (response.ok) {
    const text = await response.text();
    document.getElementById('timeDistance').textContent = text;
}

await updateDistances();

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
const content = document.getElementById('content');

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

                /*checking if both departure and arrival aerodromes are set already*/
                content.classList.add('loading')
                fetch('/get-flight')
                    .then(response => response.json())
                    .then(async data => {
                        const route = data.route;
                        if (route.length <= 1) { //if there are no waypoints yet
                            const departureCoords = await fetchAvCoords(departureAirport_code.value);
                            const arrivalCoords = await fetchAvCoords(arrivalAirport_code.value);

                            //swap the coordinates to give lat-long instead of long-lat (like why tho, OpenAIP ._.)
                            [departureCoords[0][0], departureCoords[0][1]] = [departureCoords[0][1], departureCoords[0][0]]; 
                            [arrivalCoords[0][0], arrivalCoords[0][1]] = [arrivalCoords[0][1], arrivalCoords[0][0]];

                            await add_waypoint(departureCoords[0], departureCoords[1]);
                            await add_waypoint(arrivalCoords[0], arrivalCoords[1]);

                            reload_map();
                            update_route_names();
                            content.classList.remove('loading');
                        } else {
                            showAlert("Both aerodromes are set already. Clear the route to reset them.");
                            content.classList.remove('loading');
                        }
                    });

                /*BIG LIMITATION - departure/arrival cant be updated instantly
                 if both aerodromes are already set, user has to clear the route first*/

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

        if (departureAirport_code.value && arrivalAirport_code.value) {

            //if the value is empty, clear the alternate airport
            if (alternateAirport_code.value.trim() === "") {
                await update("alternateAirport_code", "");
                await update("alternateAirport_name", "");
                await update("alternateAirport_coords", []);
                await update("route_changed", "True"); //to trigger navlog reload
                alternateAirport_name.style.display = "none";
                await reload_map(); //reload the map to remove the alternate route
                return;
            }

            //validating data
            if (verifyICAO(alternateAirport_code.value)) {
                const airportDetails = await fetchAirportDetails(alternateAirport_code.value);
                if (airportDetails.country == "GB") {
                    //swapping cords to lat-long
                    const alternateCoords = airportDetails.coordinates;
                    [alternateCoords[0], alternateCoords[1]] = [alternateCoords[1], alternateCoords[0]];
                    //updating session data
                    await update("alternateAirport_code", alternateAirport_code.value.toUpperCase());
                    await update("alternateAirport_name", airportDetails.name);
                    //updating the alternate coords
                    await update("alternateAirport_coords", alternateCoords);
                    await update("route_changed", "True"); //to trigger navlog reload

                    alternateAirport_code.style.textTransform = "uppercase";
                    alternateAirport_name.textContent = airportDetails.name;
                    updateDistances();
                    await reload_map(); //reload the map to show the alternate route

                } else if (airportDetails.country != "GB") {
                    showAlert("Only UK aerodromes are supported");
                    alternateAirport_name.style.display = "none";
                }
            } else {
                showAlert("Invalid ICAO code");
                alternateAirport_name.style.display = "none";
            }
        } else {
            showAlert("Please make sure both departure and arrival aerodromes are set before adding an alternate airport.");
            alternateAirport_name.style.display = "none";
        }
    }
});

//------------------------------ROUTE MAP------------------------------
const mapTilerLogo = document.getElementById("mapTilerLogo");

async function load_map() {
    return new Promise((resolve) => {
        if (map) {
            map.remove();
            map = null;
        }
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
                const alternate_coords = FlightData.flight.alternateAirport_coords;

                if (mapStyle == 'normal' && theme == 'light') {
                    mapTilerLogo.style.display = "none";
                    //crafting the map
                    map = L.map('routeMAP', { 
                    center: route.length > 0 ? [route[route.length - 2][0], route[route.length - 2][1]] : [51.505, -0.09], //Initial center coords (set to first route point or London)
                    zoom: 10.3,
                    layers: [Basemap, OpenAIP]
                }); 
                const line = L.polyline(route, { color: '#f0F' , weight: 5, measurementOptions : { imperial:true }})
                .addTo(map)
                .showMeasurements();
                
                //adding alternate
                if (alternate_coords.length == 2) {
                const alt_line = L.polyline([route[route.length - 1], alternate_coords], { color: '#ffa500' , weight: 7, measurementOptions : { imperial:true }, dashArray: '5, 10' })
                .addTo(map)
                .showMeasurements();
                }

                } else if (mapStyle == 'normal' && theme == 'dark') {
                    mapTilerLogo.style.display = "none";
                    //crafting the map
                    map = L.map('routeMAP', { 
                    center: route.length > 0 ? [route[route.length - 2][0], route[route.length - 2][1]] : [51.505, -0.09], //Initial center coords (set to first route point or London)
                    zoom: 10.3,
                    layers: [Darkmode, OpenAIP]
                }); 
                const line = L.polyline(route, { color: '#f0F' , measurementOptions : { imperial:true }})
                .addTo(map)
                .showMeasurements();

                //adding alternate
                if (alternate_coords.length == 2) {
                const alt_line = L.polyline([route[route.length - 1], alternate_coords], { color: '#ffa500' , weight: 7, measurementOptions : { imperial:true }, dashArray: '5, 10' })
                .addTo(map)
                .showMeasurements();
                }

                } else if (mapStyle == 'satellite') {
                    mapTilerLogo.style.display = "inline";
                    //crafting the map
                    map = L.map('routeMAP', { 
                    center: route.length > 0 ? [route[route.length - 2][0], route[route.length - 2][1]] : [51.505, -0.09], //Initial center coords (set to first route point or London)
                    zoom: 10.3,
                    layers: [Satellite, OpenAIP]
                    //crafting the map
                });
                const line = L.polyline(route, { color: '#f0F' , measurementOptions : { imperial:true }})
                .addTo(map)
                .showMeasurements(); //show the distances between each point on the map
                }

                //adding alternate
                if (alternate_coords.length == 2) {
                const alt_line = L.polyline([route[route.length - 1], alternate_coords], { color: '#ffa500' , weight: 7, measurementOptions : { imperial:true }, dashArray: '5, 10' })
                .addTo(map)
                .showMeasurements();
                }

                //adding circles to determine turning points
                route.forEach((coord) => {
                    const circle = L.circle(coord, {color: 'black',fillColor: 'rgb(248, 248, 8)',fillOpacity: 0.4, radius: 300 })
                    .addTo(map)
                })

                resolve();
            })

            .catch(error => {
                console.error('MapCreationError', error);
                resolve();
            });
        });
    });

}
//-------------------------------------------ROUTE PLAN-----------------------------------------------------

//------------------------adding a waypoint

async function add_waypoint(waypoint, name) {
    try {
    const response = await fetch("/add-waypoint", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ waypoint: waypoint , name: name}), //sends off the corrdinates to the backend
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
        await add_waypoint(data.coordinates, data.name.toUpperCase());

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
    return [data.coordinates, data.name]; //returns the coordinates

    } catch (error) {
        showAlert("Waypoint not found. Please check the name and location of your waypoint and try again.");
        return null;
    }
}

//----------------Adding an aviation feature as a waypoint

async function add_av(avPoint) {
    try {
        var AvCoords = await fetchAvCoords(avPoint);
        } catch (error) {
        showAlert("Waypoint not found. Please check the name and location of your waypoint and try again.");
        return null;
        }

    [AvCoords[0][0], AvCoords[0][1]] = [AvCoords[0][1], AvCoords[0][0]];
    await add_waypoint(AvCoords[0], AvCoords[1]);
}

//----------------------Updating map without reloading page


function reload_map() {
    //removes map instance without removing the whole container
    if (map) {
      try {
        map.off(); //detaches any event listeners (i dont have any here anyways)
        map.remove(); //removes the whole contaier
      } catch (error) {
        console.warn("Error removing map during reload:", error);
      }
    }
    map = null; //container then re innitalized but set to null
    return load_map();
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



//updating the route names list
const route_names = document.getElementById('route_names')

function update_route_names() {
    fetch('/get-flight')
        .then(response => response.json())
        .then(FlightData => {
            const route = FlightData.route_names;
            route_names.value = route.join(' ➔ ');
        });

    
}

//-------------------ADDING AND REMOVING WAYPOINTS MANUALLY----------------
//adding event listener to the waypoint form
const waypoint = document.getElementById('searchWaypoint')

//for button styling
const addWaypointContainer = document.getElementById('addWaypointContainer')

//wait for a submission by the user
document.getElementById('addWaypointForm').onsubmit = async function(event) {
    event.preventDefault();

    //determine whether to add or remove a waypoint (by reading what is stored in the value)
    const actionValue = (event.submitter && event.submitter.value) || new FormData(this).get('action');

    //**************REMOVING A WAYPOINT*****************
    if (actionValue === 'remove') {
        addWaypointContainer.classList.add('loading')
        //first, get the index of the waypoint to be removed
        fetch('/get-flight')
        .then(response => response.json())
        .then(async data => {
            const route_names = data.route_names;
            const WaypointIndex = route_names.indexOf(waypoint.value.toUpperCase());
            
            //if the waypoint is not found, alert the user
            if (WaypointIndex == -1) {
                showAlert("Waypoint not found in the current route. Please check the name and try again.");
                waypoint.value = '';
                addWaypointContainer.classList.remove('loading')
                return;

                //prevent removing departure or arrival aerodrome
            } else if (waypoint.value.toUpperCase() == data.departureAirport_code || waypoint.value.toUpperCase() == data.destinationAirport_code) {
                showAlert("You cannot remove the departure or arrival aerodrome from here. Please start a new flight.");
                waypoint.value = '';
                addWaypointContainer.classList.remove('loading')
                return;
            }

            //then, remove the waypoint using the index
            try {
            const response = await fetch("/remove-waypoint", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ waypointIndex: WaypointIndex }), //sends off the index to the backend
            });

            if (!response.ok) {
                throw new Error("Network response was not ok"); //for non-200 errors
            }

            } catch (error) {
                showAlert("An error occured whilst removing the waypoint. Please try again.");
                addWaypointContainer.classList.remove('loading')
                return null;
            }
            
            waypoint.value = '';
            reload_map();
            update_route_names();
            await updateDistances();
            update("route_changed", "True");
            addWaypointContainer.classList.remove('loading')
            });
        
      
        
        //*************ADDING A WAYPOINT*****************
    } else if (actionValue === 'add') {
        addWaypointContainer.classList.add('loading')
        //get the current waypoint type from settings
        //(to know whether to add a city or an aviation feature)
        fetch('/get-all')
        .then(response => response.json())
        .then(async data => {
            const addType = data.settings.waypoint_addType;
            const departureAirport = data.flight.departureAirport_code;
            const destinationAirport = data.flight.destinationAirport_code;
            const route_names = data.flight.route_names;

            //prevent adding duplicate waypoints
            if (route_names.includes(waypoint.value.toUpperCase())) {
                showAlert("This waypoint is already in the current route. Please choose another waypoint.");
                waypoint.value = '';
                addWaypointContainer.classList.remove('loading')
                return;
            }

            //prevent adding departure or arrival airport as a waypoint
            if (departureAirport == '' || destinationAirport == '') {
                showAlert("Please make sure both departure and arrival aerodromes are set before adding waypoints.");
                waypoint.value = '';
                addWaypointContainer.classList.remove('loading')
                return;
                
            } else if (waypoint.value.toUpperCase() == departureAirport || waypoint.value.toUpperCase() == destinationAirport) {
                showAlert("You cannot add the departure or arrival aerodrome as a waypoint.");
                waypoint.value = '';
                addWaypointContainer.classList.remove('loading')
                return;
            } 

            //if all is valid a waypoint can be added
            if (addType == 'City/Town') {
                await add_city(waypoint.value);
                waypoint.value = '';

            } else if (addType == 'VRP/NAVAID/Airport') {
                await add_av(waypoint.value);
                waypoint.value = ''; 
            }
            reload_map();
            update_route_names();
            await updateDistances();
            update("route_changed", "True");
            addWaypointContainer.classList.remove('loading')
        });
    }

};

//---------------------------------------------ROUTE GENERATOR----------------------------------------

const generate = document.getElementById('generateRoute');
const output = document.getElementById('routeOutput');
const routePrompt = document.getElementById('routePrompt');

generate.addEventListener('click',  async () => {
    generate.disabled = true; //preventing multiple clicks
    generate.textContent = "Generating...";

    fetch('/get-flight')
    .then(response => response.json())
    .then(async FlightData => {
        const departureAirport = FlightData.departureAirport_code;
        const destinationAirport = FlightData.destinationAirport_code;
        const route_names = FlightData.route_names;
        const route = FlightData.route;

        //if there is a prompt provided by the user, use that to generate the route
        if (routePrompt.value && departureAirport && destinationAirport) {
            var text = `Generate a VFR route within the UK based on the user’s instructions and the provided departure, arrival, and any partial existing route as given below.
                    (if you choose to edit around an existing route, provide a full route including those existing waypoints)
                    You must strictly follow all rules from your global instructions.
                    Interpret the user’s intent precisely while maintaining VFR legality and airspace awareness.
                    Departure Airport: ${departureAirport} coordinates ${route[0][1]}, ${route[0][0]}
                    Arrival Airport: ${destinationAirport} coordinates ${route[route.length - 1][1]}, ${route[route.length - 1][0]}
                    Existing Route Waypoints: ${route_names.join(', ')}
                    User Instructions: ${routePrompt.value}
                    
                    If choosing a VRP or a Navaid, names AND coordinates MUST be chosen from the list provided below.
                    If choosing a city or town, that is not already a vrp, use the appopriate name and coordinates from your own knowledge, and ensure the coordinates are accurate.
                    You have full flexibility to use Navaids, VRPs or cities/towns when generating a route, so long as they meet user requirements.
                    Please ensure you do not change the coordinates of the departure or arrival aerodromes.`
                    

        //if there is no prompt, generate a route based on the current *route setup* so, no departure and arrival only
        } else if (!routePrompt.value && departureAirport && destinationAirport) {
            var text = `Generate a sensible, safe, airspace-aware VFR route between the provided departure and arrival aerodromes.
                    You must strictly follow all rules from your global instructions.
                    Choose logical VFR waypoints such as VRPs, navaids, cities/towns, or airports to shape a practical route that respects controlled airspace.
                    Departure Airport: ${departureAirport} coordinates ${route[0][1]}, ${route[0][0]}
                    Arrival Airport: ${destinationAirport} coordinates ${route[route.length - 1][1]}, ${route[route.length - 1][0]}
                    
                    If choosing a VRP or a Navaid, names AND coordinates must be chosen from the list provided below.
                    If choosing a city or town, that is not already a vrp, use the appopriate name and coordinates from your own knowledge, and ensure the coordinates are accurate.
                    You have full flexibility to use Navaids, VRPs or cities/towns when generating a route.
                    Please ensure you do not change the coordinates of the departure or arrival aerodromes.`
        } else {
            showAlert("Please make sure both departure and arrival aerodromes are set before generating a route.");
            generate.disabled = false; //allow clicking again
            generate.textContent = "Generate";
            return;
        }

        var response = await prompt('Route', text);
        try {
            response = JSON.parse(response); //parsing the response to JSON
            output.textContent = response.justification; //displaying the result in the box 

        } catch (error) {
            console.log(error);
            showAlert("An error occured whilst generating the route. Please try again.");
            generate.disabled = false; //allow clicking again
            generate.textContent = "Generate";
            return;
        }
        
        //adding the waypoints to the route
        await update('route_names', response.route_names);
        await update('route', response.route);
        await update('route_gen_justification', response.justification);
        reload_map();
        update_route_names();
        await updateDistances();
        update("route_changed", "True");

        generate.disabled = false; //allow clicking again
        generate.textContent = "Generate";

    });
    }
);


//--------------------------TOOLTIP--------------------------
const tooltip = document.getElementById("tooltip");
const closeTooltip = document.getElementById("closeTooltip");
const showTooltip = document.getElementById("routeSetupTooltip")

//show when info icon clicked
showTooltip.addEventListener("click", function() {
    tooltip.style.display = "block"
})

//close when 'close' button clicked
closeTooltip.addEventListener("click", function() {
    tooltip.style.display = "none"
})

//------------------------DISTANCE FINDING and BEARINGS----------------------

async function getDistance(coord_arr, alternate_coords) {
    var len = coord_arr.length;
    let total = 0
    var separate_distances = []
    var separate_bearings = []
    let operative = false

    //finding correct units
    const response = await fetch( "/get-settings");
    const settings = await response.json();
    const distance_unit = settings.units_distance;

    if (distance_unit === "nautical_mile") {var divideBy = 1852}
    else if (distance_unit === "kilometer") {var divideBy = 1000}
    else if (distance_unit === "us_statute_mile") {var divideBy = 1609.344}

    //iterate through the route coordinates
    //and find the distance between each point and the next
    do {
        try {
            for (let i = 0; i < len - 1; i++) {
                var distance = map.distance(coord_arr[i], coord_arr[i+1]) / divideBy;
                total = total + distance
                var bearing = getBearing(coord_arr[i], coord_arr[i+1]);

                if (alternate_coords.length == 2) { //only update if alternate is set
                    var update_alternate = true
                    var alt_distance = map.distance(coord_arr[i+1], alternate_coords) / divideBy;
                    var alt_bearing = getBearing(coord_arr[i+1], alternate_coords);
                }

                separate_bearings.push(bearing)
                separate_distances.push(distance)
                operative = true
            }

            if (update_alternate) {
            await update("alternate_distance", alt_distance);
            await update("alternate_track", alt_bearing);
            }

        } catch (error) { //in case the map isnt loaded yet
            operative = false
            await reload_map();
        }
    } while (!operative);

    //updating the session to include distance values
    await update("separate_distances", separate_distances)
    await update("separate_bearings", separate_bearings)
    await update("distance.value", total)

    return total
}

//updating the distance display
async function updateDistances() {
        fetch('/get-flight')
        .then(response => response.json())
        .then(async FlightData => {
            const route_coords = FlightData.route;
            const alternate_coords = FlightData.alternateAirport_coords;
            const time = FlightData.time

        //only update the distance when a waypoint exits
        if (route_coords.length >= 3) {
            var total = await getDistance(route_coords, alternate_coords);
        } else {
            return;
        }

        //updating the distance to display to the user
        const response = await fetch('/distance');
        if (response.ok) {
            const text = await response.text();
            document.getElementById('Distance').textContent = text;
        }
        
        return total
    });
    
}
   

//------------------------BEARINGS-----------------
function getBearing(start, end) {

    const p1 = new LatLon(start[0], start[1]);
    const p2 = new LatLon(end[0], end[1]);

    const bearing = p1.initialBearingTo(p2);
    return bearing;
}