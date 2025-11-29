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

//-------Update weather report------------
const update_wx = document.getElementById('update');
const code_searched = document.getElementById('airport_code');

async function getWeather(code) {
    if (code === "") {
        showAlert("Couldn't get data for seached aerodrome. Please enter an ICAO code.");
        return;
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

//-------------------updating all weather data------------
const metar_searched = document.getElementById('METAR_searched');
const taf_searched = document.getElementById('TAF_searched');
const metar_searched_decoded = document.getElementById('METAR_searched_decoded');
const taf_searched_decoded = document.getElementById('TAF_searched_decoded');


update_wx.addEventListener('click', async () => {
    //Add loading feedback here
    const wx_searched = await getWeather(code_searched.value);

    if (wx_searched) {
        //update the session as well as the actual text for each report
        await update("METAR_searched", wx_searched.metar.raw_text);
        metar_searched.textContent = wx_searched.metar.raw_text;

        await update("TAF_searched", wx_searched.taf.raw_text);
        taf_searched.textContent = wx_searched.taf.raw_text;

        await update("METAR_searched_decoded", wx_searched.metar);
        metar_searched_decoded.textContent = parseMETAR(wx_searched.metar);

        await update("TAF_searched_decoded", wx_searched.taf);
        taf_searched_decoded.textContent = parseTAF(wx_searched.taf);

    }
});

function parseMETAR(metar) {
    //parsing logic here
}

function parseTAF(taf) {
    //parsing logic here
}

