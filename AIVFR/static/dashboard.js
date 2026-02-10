import { update, updateSettings, showAlert } from "./basePage.js";

await updateSettings("current_page", "/dashboard");
//------SAVE BUTTON-------

const saveButton = document.getElementById("save");

saveButton.addEventListener("click", () => {
    saveButton.classList.add("savingOrSaved");
    saveButton.textContent = "SAVING...";
    
    saveFlight();
    update("saved", "True");

    setTimeout(() => {
        saveButton.textContent = "SAVED";
    }, 2000); //2 seconds to simulate saving time

})

async function saveFlight() {
    //fetch session data.flight from flask
    const response = await fetch("/save-flight");
    const data = await response.json();

    //save the flight data.flight as a json file
    const blob = new Blob([JSON.stringify(data.flight)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    //set the file name to departure and destination airports for uniqueness
    a.download = `${data.flight.flight_data.flight.flight.departureAirport_code}-${data.flight.flight_data.flight.flight.destinationAirport_code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


//---Fetching flight data.flight from flask to use in dashboard
const response = await fetch("/get-all");
const data = await response.json();



//---------WEIGHT AND PERFORMANCE--------
//---aircraft input
const aircraft = document.getElementById("aircraft");

aircraft.addEventListener("change", () => {
    update("aircraft", aircraft.value);
})

//---determining and updating POB (persons on board)

let pob = 1; //assume at least the pilot is on board...

//if we have weight values for pilot2, PAX1 and PAX2, we can assume they are occupied
if (data.flight.weight_items.pilot2.weight.value != 0) {
    pob += 1;
} if (data.flight.weight_items.PAX1.weight.value != 0) {
    pob += 1;
} if (data.flight.weight_items.PAX2.weight.value != 0) {
    pob += 1;
}

const POB = document.getElementById("POB");
POB.innerHTML = `<b>POB: </b>${pob}`;

//---------ROUTE DETAILS-------
//---determining the cruise altitude
let cruiseAltitude = 0;

//iterate through the NAVLOG rows to find the highest planned altitude, which we can assume is the cruise altitude
for (const row_index in data.flight.NAVLOG.rows) {
    const altitude = data.flight.NAVLOG.rows[row_index]["ALT PLAN (FT)"].value;
    if (altitude > cruiseAltitude) {
        cruiseAltitude = altitude;
    }
}

if (data.settings.units_altitude == "metre") {
    cruiseAltitude = Math.round(cruiseAltitude * 0.3048); //convert feet to meters
}

const cruise_alt = document.getElementById("cruise_alt");

//using a tertiary when updating to put the relevant units for altitude based on the user's settings
cruise_alt.innerHTML = `<b>Cruise: </b>${cruiseAltitude} ${data.settings.units_altitude == "feet" ? 'ft' : 'm'}`;

//------------WEATHER--------
//------------------initializing grading colours and styling
const grading = document.getElementsByClassName('grading');

async function initializeGradingColors() {
    for (let i = 0; i < grading.length; i++) {
        if (grading[i].textContent == "VFR") {
            grading[i].style.color = "#40d400";
        } else if (grading[i].textContent == "MVFR") {
            grading[i].style.color = "#0091ff";
        } else if (grading[i].textContent == "IFR") {
            grading[i].style.color = "red";
        } else if (grading[i].textContent == "LIFR") {
            grading[i].style.color = "#800080";
        }
    }

}

async function getWeather(code) {
    if (code === "") {
        return undefined;
    }

    try {
        const response = await fetch("/get-weather", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code.toUpperCase() }), //sends off the code to the backend
        });

        if (!response.ok) {
            throw new Error("Network response was not ok"); //for non-200 errors
        }

        const data = await response.json();
        return data; //returns the weather data

        } catch (error) {
            showAlert("Error fetching weather data");
            return null;
        }
};

//----displaying weather data for departure, destination and alternate airports

const METAR_departure = document.getElementById("departure_WX_metar");
const METAR_arrival = document.getElementById("arrival_WX_metar");
const METAR_alternate = document.getElementById("alternate_WX_metar");
const departure_WX_grading = document.getElementById("departure_WX_grading");
const arrival_WX_grading = document.getElementById("arrival_WX_grading");
const alternate_WX_grading = document.getElementById("alternate_WX_grading");

const refreshWX = document.getElementById("refresh_WX");

async function displayWeather() {
    //feedback for refresh button
    refreshWX.classList.add("refreshing");

    //fetaching the data
    if (data.flight.departureAirport_code) {
    var departureWeather = await getWeather(data.flight.departureAirport_code);
    } else {
        var departureWeather = undefined;
    } 
    
    if (data.flight.destinationAirport_code) {
    var arrivalWeather = await getWeather(data.flight.destinationAirport_code);
    } else {
        var arrivalWeather = undefined;
    } 
    
    if (data.flight.alternateAirport_code) {
    var alternateWeather = await getWeather(data.flight.alternateAirport_code);
    } else {
        var alternateWeather = undefined;
    }

    //displaying the METARs should they exist
    if (departureWeather) {
        METAR_departure.innerHTML = `<b>${departureWeather.metar.raw_text}</b>`;
        departure_WX_grading.innerHTML = `<b class='grading'>${departureWeather.metar.flight_category}</b>`;
    } else {
        METAR_departure.innerHTML = "<b>METAR not available</b>";
        departure_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }

    if (arrivalWeather) {
        METAR_arrival.innerHTML = `<b>${arrivalWeather.metar.raw_text}</b>`;
        arrival_WX_grading.innerHTML = `<b class='grading'>${arrivalWeather.metar.flight_category}</b>`;
    } else {
        METAR_arrival.innerHTML = "<b>METAR not available</b>";
        arrival_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }

    if (alternateWeather) {
        METAR_alternate.innerHTML = `<b>${alternateWeather.metar.raw_text}</b>`;
        alternate_WX_grading.innerHTML = `<b class='grading'>${alternateWeather.metar.flight_category}</b>`;
    } else {
        METAR_alternate.innerHTML = "<b>METAR not available</b>";
        alternate_WX_grading.innerHTML = "<b style='color: gray;'>NIL</b>";
    }
    await initializeGradingColors();
    //feedback for refresh button
    refreshWX.classList.remove("refreshing");
}

//--on page load:
await displayWeather();

//refreshing the weather data

refreshWX.addEventListener("click", () => {
    displayWeather();
})