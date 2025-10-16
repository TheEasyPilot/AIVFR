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
    try {
        const response = await fetch("/fetch-airport-details", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: code }), /*sends off the code to the backend*/
        });

        if (!response.ok) {
            throw new Error("Network response was not ok"); /*for non-200 errors*/
        }

        const data = await response.json();
        return data; /*returns the airport details*/

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
        departureAirport_name.style.display = "inline"; /*make the name div visible*/
        departureAirport_name.textContent = "..."; /*simulate loading*/

        //validating data
        if (verifyICAO(departureAirport_code.value)) {
            const airportDetails = await fetchAirportDetails(departureAirport_code.value);
            if (airportDetails) {
                await update("departureAirport_code", departureAirport_code.value);
                await update("departureAirport_name", airportDetails.name);
                departureAirport_name.textContent = airportDetails.name;
            }
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
        arrivalAirport_name.style.display = "inline";
        arrivalAirport_name.textContent = "...";

        //validating data
        if (verifyICAO(arrivalAirport_code.value)) {
            const airportDetails = await fetchAirportDetails(arrivalAirport_code.value);
            if (airportDetails) {
                await update("destinationAirport_code", arrivalAirport_code.value);
                await update("destinationAirport_name", airportDetails.name);
                arrivalAirport_name.textContent = airportDetails.name;
            }
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
        alternateAirport_name.style.display = "inline";
        alternateAirport_name.textContent = "...";

        //validating data
        if (verifyICAO(alternateAirport_code.value)) {
            const airportDetails = await fetchAirportDetails(alternateAirport_code.value);
            if (airportDetails) {
                await update("alternateAirport_code", alternateAirport_code.value);
                await update("alternateAirport_name", airportDetails.name);
                alternateAirport_name.textContent = airportDetails.name;
            }
        } else {
            showAlert("Invalid ICAO code");
        }
    }
});
