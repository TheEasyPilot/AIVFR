import { update, showAlert } from "./basePage.js";

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

//-------Departure Airport (ICAO)------------
const departureAirport_code = document.getElementById("departure_code");
const departureAirport_name = document.getElementById("departure_name");

departureAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {

        //validating data
        if (verifyICAO(departureAirport_code.value)) {
            await update("departureAirport_code", departureAirport_code.value);
            await update("departureAirport_name", `airport name for ${departureAirport_code.value}`);
        } else {
            showAlert("Invalid ICAO code");
        }
    }
});

//-------Arrival Airport (ICAO)------------

const arrivalAirport_code = document.getElementById("arrival_code");
const arrivalAirport_name = document.getElementById("arrival_name");

arrivalAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {

        //validating data
        if (verifyICAO(arrivalAirport_code.value)) {
            await update("destinationAirport_code", arrivalAirport_code.value);
            await update("destinationAirport_name", `airport name for ${arrivalAirport_code.value}`);
        } else {
            showAlert("Invalid ICAO code");
        }
    }
});

//-------Alternate Airport (ICAO)------------
const alternateAirport_code = document.getElementById("alternate_code");
const alternateAirport_name = document.getElementById("alternate_name");

alternateAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
    
        //validating data
        if (verifyICAO(alternateAirport_code.value)) {
            await update("alternateAirport_code", alternateAirport_code.value);
            await update("alternateAirport_name", `airport name for ${alternateAirport_code.value}`);
        } else {
            showAlert("Invalid ICAO code");
        }
    }
});
