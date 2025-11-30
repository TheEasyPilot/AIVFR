import { update, showAlert } from "./basePage.js";

const grading = document.getElementsByClassName('grading');

//initializing grading colours and styling
function initializeGradingColors() {
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
initializeGradingColors();

//styling for item titles
//this takes temporary decoded weather data from the backend (if it exists) and inserts it into the correct divs
//along with proper HTML formatting
const resp = await fetch("/get-flight")
const weather = await resp.json();
var TEMPtaf_searched_decoded = weather.TAF_searched_decoded;
var TEMPmetar_searched_decoded = weather.METAR_searched_decoded;
var TEMPtaf_departure_decoded = weather.TAF_departure_decoded;
var TEMPmetar_departure_decoded = weather.METAR_departure_decoded;
var TEMPtaf_arrival_decoded = weather.TAF_arrival_decoded;
var TEMPmetar_arrival_decoded = weather.METAR_arrival_decoded;

//geting dep and arrival aerodromes to be used when fetching weather
const departure_aerodrome = weather.departureAirport_code;
const arrival_aerodrome = weather.destinationAirport_code;

//searched aerodrome weather
if (TEMPtaf_searched_decoded && TEMPmetar_searched_decoded) {
    var metar_searched_decodedTEMP = document.getElementById('METAR_searched_decoded');
    var taf_searched_decodedTEMP = document.getElementById('TAF_searched_decoded');
    taf_searched_decodedTEMP.innerHTML = TEMPtaf_searched_decoded
    metar_searched_decodedTEMP.innerHTML = TEMPmetar_searched_decoded
}

//departure weather
if (TEMPtaf_departure_decoded && TEMPmetar_departure_decoded) {
    var metar_departure_decodedTEMP = document.getElementById('METAR_departure_decoded');
    var taf_departure_decodedTEMP = document.getElementById('TAF_departure_decoded');
    taf_departure_decodedTEMP.innerHTML = TEMPtaf_departure_decoded
    metar_departure_decodedTEMP.innerHTML = TEMPmetar_departure_decoded
}

//arrival weather
if (TEMPtaf_arrival_decoded && TEMPmetar_arrival_decoded) {
    var metar_arrival_decodedTEMP = document.getElementById('METAR_arrival_decoded');
    var taf_arrival_decodedTEMP = document.getElementById('TAF_arrival_decoded');
    taf_arrival_decodedTEMP.innerHTML = TEMPtaf_arrival_decoded
    metar_arrival_decodedTEMP.innerHTML = TEMPmetar_arrival_decoded
}

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

//--------------------Departure and arrival weather switches--------------------
const WX_departure_METAR_switch = document.getElementById('WX_departure_METAR_switch');
const WX_departure_TAF_switch = document.getElementById('WX_departure_TAF_switch');
const WX_arrival_METAR_switch = document.getElementById('WX_arrival_METAR_switch');
const WX_arrival_TAF_switch = document.getElementById('WX_arrival_TAF_switch');
const METARDeparture = document.getElementById('METARDeparture');
const TAFArrival = document.getElementById('TAFArrival');
const TAFDeparture = document.getElementById('TAFDeparture');
const METARArrival = document.getElementById('METARArrival');

//initializing visibility of metar/taf based on current switch settings
//only the selected report is shown. The other is hidden.
const response = await fetch("/get-flight")
const flight = await response.json();

if (flight.WX_switch_dep == "METAR") {
    METARDeparture.style.display = "block";
    TAFDeparture.style.display = "none";

} else if (flight.WX_switch_dep == "TAF") {
    METARDeparture.style.display = "none";
    TAFDeparture.style.display = "block";
}

if (flight.WX_switch_arr == "METAR") {
    METARArrival.style.display = "block";
    TAFArrival.style.display = "none";

} else if (flight.WX_switch_arr == "TAF") {
    METARArrival.style.display = "none";
    TAFArrival.style.display = "block";
}

WX_departure_METAR_switch.addEventListener('click', async () => {
    WX_departure_METAR_switch.classList.add('active');
    WX_departure_TAF_switch.classList.remove('active');
    METARDeparture.style.display = "block";
    TAFDeparture.style.display = "none";
    update("WX_switch_dep", "METAR");
});

WX_departure_TAF_switch.addEventListener('click', async () => {
    WX_departure_TAF_switch.classList.add('active');
    WX_departure_METAR_switch.classList.remove('active');
    TAFDeparture.style.display = "block";
    METARDeparture.style.display = "none";
    update("WX_switch_dep", "TAF");
});

WX_arrival_METAR_switch.addEventListener('click', async () => {
    WX_arrival_METAR_switch.classList.add('active');
    WX_arrival_TAF_switch.classList.remove('active');
    METARArrival.style.display = "block";
    TAFArrival.style.display = "none";
    update("WX_switch_arr", "METAR");
});

WX_arrival_TAF_switch.addEventListener('click', async () => {
    WX_arrival_TAF_switch.classList.add('active');
    WX_arrival_METAR_switch.classList.remove('active');
    TAFArrival.style.display = "block";
    METARArrival.style.display = "none";
    update("WX_switch_arr", "TAF");
});


//-------------------updating all weather data------------
const metar_searched = document.getElementById('METAR_searched');
const taf_searched = document.getElementById('TAF_searched');
const metar_searched_decoded = document.getElementById('METAR_searched_decoded');
const taf_searched_decoded = document.getElementById('TAF_searched_decoded');
const METAR_searched_grading = document.getElementById('METAR_searched_grading');

const metar_departure = document.getElementById('METAR_departure');
const taf_departure = document.getElementById('TAF_departure');
const metar_departure_decoded = document.getElementById('METAR_departure_decoded');
const taf_departure_decoded = document.getElementById('TAF_departure_decoded');
const METAR_departure_grading = document.getElementById('METAR_departure_grading');

const metar_arrival = document.getElementById('METAR_arrival');
const taf_arrival = document.getElementById('TAF_arrival');
const metar_arrival_decoded = document.getElementById('METAR_arrival_decoded');
const taf_arrival_decoded = document.getElementById('TAF_arrival_decoded');
const METAR_arrival_grading = document.getElementById('METAR_arrival_grading');


update_wx.addEventListener('click', async () => {
    //Add loading feedback here
    const wx_searched = await getWeather(code_searched.value);
    const wx_departure = await getWeather(departure_aerodrome);
    const wx_arrival = await getWeather(arrival_aerodrome);

    if (wx_searched) {
        //update the session as well as the actual decoded text for each report
        //------------SEARCHED WX-----------
        await update("METAR_searched", wx_searched.metar.raw_text);
        metar_searched.textContent = wx_searched.metar.raw_text;

        await update("TAF_searched", wx_searched.taf.raw_text);
        taf_searched.textContent = wx_searched.taf.raw_text;

        await update("METAR_searched_decoded", await parseMETAR(wx_searched.metar, METAR_searched_grading));
        metar_searched_decoded.innerHTML = await parseMETAR(wx_searched.metar, METAR_searched_grading);

        await update("TAF_searched_decoded", await parseTAF(wx_searched.taf));
        taf_searched_decoded.innerHTML = await parseTAF(wx_searched.taf);

        //------------DEPARTURE WX-----------
        await update("METAR_departure", wx_departure.metar.raw_text);
        metar_departure.textContent = wx_departure.metar.raw_text;

        await update("TAF_departure", wx_departure.taf.raw_text);
        taf_departure.textContent = wx_departure.taf.raw_text;
        await update("METAR_departure_decoded", await parseMETAR(wx_departure.metar, METAR_departure_grading));
        metar_departure_decoded.innerHTML = await parseMETAR(wx_departure.metar, METAR_departure_grading);

        await update("TAF_departure_decoded", await parseTAF(wx_departure.taf));
        taf_departure_decoded.innerHTML = await parseTAF(wx_departure.taf);

        //------------ARRIVAL WX-----------
        await update("METAR_arrival", wx_arrival.metar.raw_text);
        metar_arrival.textContent = wx_arrival.metar.raw_text;

        await update("TAF_arrival", wx_arrival.taf.raw_text);
        taf_arrival.textContent = wx_arrival.taf.raw_text;

        await update("METAR_arrival_decoded", await parseMETAR(wx_arrival.metar, METAR_arrival_grading));
        metar_arrival_decoded.innerHTML = await parseMETAR(wx_arrival.metar, METAR_arrival_grading);

        await update("TAF_arrival_decoded", await parseTAF(wx_arrival.taf));
        taf_arrival_decoded.innerHTML = await parseTAF(wx_arrival.taf);

    }
});

async function parseMETAR(metar, gradingHTML) {
    //fetching current units
    const response = await fetch("/get-settings");
    const settings = await response.json();
    
    const wind_unit = settings.units_airspeed;
    const altitude_unit = settings.units_altitude;

    //airspeed
    if (wind_unit == "knot") {
        var windspeed = `${metar.wind.speed_kts} knots`;
    } else if (wind_unit == "kilometer_per_hour") {
        var windspeed = `${metar.wind.speed_kph} km/h`;
    } else if (wind_unit == "mile_per_hour") {
        var windspeed = `${metar.wind.speed_mph} mph`;
    }

    //altitude
    if (altitude_unit == "feet") {
        try {
          var ceiling = `${metar.ceiling[0]?.feet} feet`;  
        }
        catch (TypeError) {
          var ceiling = "N/A";  
        }
        var cloud_base = `${metar.clouds[0]?.base_feet_agl} feet`;
        if (cloud_base == "undefined feet") {
            cloud_base = "N/A";
        }

    } else if (altitude_unit == "meter") {
        try {
          var ceiling = `${metar.ceiling[0]?.meters} meters`;  
        }
        catch (TypeError) {
          var ceiling = "N/A";  
        }
        var cloud_base = `${metar.clouds[0]?.base_metres_agl} meters`;
        if (cloud_base == "undefined meters") {
            cloud_base = "N/A";
        }
    }

    //other non-unit related values
    const time = metar.observed;
    const visibility = metar.visibility.meters;
    const visibility_text = metar.visibility.meters_text;
    const wind_direction = metar.wind.degrees;
    const temperature = metar.temperature.celsius;
    const dewpoint = metar.dewpoint.celsius;
    const pressure = metar.barometer.hpa;
    const clouds_code = metar.clouds[0].code;
    const clouds_text = metar.clouds[0].text;
    const flight_category = metar.flight_category;
    const humidity = metar.humidity.percent;

    //constructing decoded METAR string
    const decoded_METAR = `<b>Time of observation:</b> ${time}
    <b>Wind:</b> ${wind_direction}° at ${windspeed}
    <b>Visibility:</b> ${visibility} meters (${visibility_text})
    <b>Temperature:</b> ${temperature}°C
    <b>Dewpoint:</b> ${dewpoint}°C
    <b>Pressure:</b> ${pressure} hPa
    <b>Humidity:</b> ${humidity}%
    <b>Ceiling:</b> ${ceiling}
    <b>Clouds:</b> ${clouds_code} (${clouds_text})
    <b>Cloud Base:</b> ${cloud_base}
    `;

    //grading
    await update(`${gradingHTML.id}`, flight_category);
    gradingHTML.textContent = flight_category;
    initializeGradingColors();

    //returning decoded METAR
    return decoded_METAR;
}

function parseTAF(taf) {
    //parsing taf data depending on available fields
    const parsed_TAF = taf.forecast.map(f => ({
    start: f.timestamp?.from,
    end: f.timestamp?.to,
    wind: f.wind ?? null,
    visibility: f.visibility ?? null,
    clouds: (f.clouds ?? []).map(cloud => ({
        type: cloud.text,
        base_ft: cloud.base_feet_agl
    })),
    conditions: (f.conditions ?? []).map(cond => cond.text),
    change: f.change?.indicator?.text ?? null,
    probability: f.change?.probability ?? null
    }));

    let decoded_TAF = '';

    //constructing decoded TAF string
    parsed_TAF.forEach(period => { //iterate through each forecast period
        decoded_TAF += `\n<b>From:</b> ${period.start} <b>To:</b> ${period.end}\n`;
        if (period.change) { //if an item is undefined, it will be skipped
            decoded_TAF += `  <b>Change Indicator:</b> ${period.change}\n`;
        }
        if (period.probability) {
            decoded_TAF += `  <b>Probability:</b> ${period.probability}%\n`;
        }
        if (period.conditions.length > 0) {
            decoded_TAF += `  <b>Conditions:</b> ${period.conditions.join(', ')}\n`;
        }

        if (period.wind) {
            decoded_TAF += `  <b>Wind:</b> ${period.wind.degrees}° at ${period.wind.speed_kts} knots\n`;
        }
        if (period.visibility) {
            decoded_TAF += `  <b>Visibility:</b> ${period.visibility.meters} meters (${period.visibility.meters_text})\n`;
        }
        if (period.clouds.length > 0) {
            period.clouds.forEach(cloud => {
                decoded_TAF += `  <b>Clouds:</b> ${cloud.type} at ${cloud.base_ft} feet AGL\n`;
            });
        }
    });

    return decoded_TAF;
}

