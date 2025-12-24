import { update, updateSettings, showAlert } from "./basePage.js";

updateSettings("current_page", "/dashboard");
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
    //fetch session data from flask
    const response = await fetch("/save-flight");
    const data = await response.json();

    //save the flight data as a json file
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    //set the file name to departure and destination airports for uniqueness
    a.download = `${data.flight_data.flight.departureAirport_code}-${data.flight_data.flight.destinationAirport_code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}