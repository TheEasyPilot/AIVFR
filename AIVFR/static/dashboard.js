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


