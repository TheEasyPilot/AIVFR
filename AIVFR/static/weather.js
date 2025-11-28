import { update, showAlert } from "./basePage.js";

const update_wx = document.getElementById('update')

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

//-------Airport search------------
const Airport_code = document.getElementById("airport_code");
const Airport_name = document.getElementById("airport_name");

Airport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        Airport_name.style.display = "inline";
        Airport_name.textContent = "...";

        //validating data
        if (verifyICAO(Airport_code.value)) {
            const airportDetails = await fetchAirportDetails(Airport_code.value);
            if (airportDetails.country == "GB") {
                await update("WX_airportCode", Airport_code.value.toUpperCase());
                await update("WX_airportName", airportDetails.name);
                Airport_code.style.textTransform = "uppercase";
                Airport_name.textContent = airportDetails.name;

            } else if (airportDetails.country != "GB") {
                showAlert("Only UK aerodromes are supported");
                Airport_name.style.display = "none";
            }
        } else {
            showAlert("Invalid ICAO code");
            Airport_name.style.display = "none";
        }
    }
});