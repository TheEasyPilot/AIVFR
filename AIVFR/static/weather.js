import { update, showAlert } from "./basePage.js";

const grading = document.getElementsByClassName('grading');

//------------------initializing grading colours and styling
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

//----------------------------------UPDATING WEATHER FUNCTION----------------------------------

//--declarations for the individual METAR/TAF reports and decoded text--
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

//--declarations for the boxes containing METAR/TAF reports--
const WX_departure = document.getElementById('WX_departure');
const WX_arrival = document.getElementById('WX_arrival');
const reports = document.getElementById('content')



update_wx.addEventListener('click', async () => {
    //'updating...' feedback
    reports.style.opacity = '0.4'
    update_wx.style.pointerEvents = 'none'; //disable button while updating
    update_wx.style.opacity = '0.6';
    update_wx.style.backgroundColor = 'var(--onhover)'
    update_wx.style.border = 'none';
    update_wx.style.alignItems = 'center';
    update_wx.innerHTML = `<svg id='working_icon' data-name="Layer 1" id="Layer_1" fill='currentColor' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title/><path d="M19,6.76V2H6V6.76A4,4,0,0,0,7.17,9.59L9.59,12,7.17,14.41A4.06,4.06,0,0,0,6,17.24V22H19V17.24a4.06,4.06,0,0,0-1.17-2.83L15.41,12l2.42-2.41A4,4,0,0,0,19,6.76Zm-2,0a2,2,0,0,1-.59,1.41l-2.76,2.77a1.5,1.5,0,0,0,0,2.12l2.76,2.77A2,2,0,0,1,17,17.24V20H8V17.24a2,2,0,0,1,.59-1.41l2.76-2.77a1.5,1.5,0,0,0,0-2.12L8.59,8.17A2,2,0,0,1,8,6.76V4h9Z"/></svg>
    <p style="font-size: 14px;">WORKING...</p>
    `
    //fetching weather data for searched, departure and arrival aerodromes
    const wx_searched = await getWeather(code_searched.value);
    const wx_departure = await getWeather(departure_aerodrome);
    const wx_arrival = await getWeather(arrival_aerodrome);

    try {

    if (wx_searched) {
        metar_searched.classList.add('active')
        taf_searched.classList.add('active')

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

    } if (wx_departure) {
        WX_departure.classList.remove('inop');
        metar_departure.classList.add('active');
        taf_departure.classList.add('active');
        //------------DEPARTURE WX-----------
        await update("METAR_departure", wx_departure.metar.raw_text);
        metar_departure.textContent = wx_departure.metar.raw_text;

        await update("TAF_departure", wx_departure.taf.raw_text);
        taf_departure.textContent = wx_departure.taf.raw_text;
        await update("METAR_departure_decoded", await parseMETAR(wx_departure.metar, METAR_departure_grading));
        metar_departure_decoded.innerHTML = await parseMETAR(wx_departure.metar, METAR_departure_grading);

        await update("TAF_departure_decoded", await parseTAF(wx_departure.taf));
        taf_departure_decoded.innerHTML = await parseTAF(wx_departure.taf);

    } if (wx_arrival) {
        WX_arrival.classList.remove('inop');
        metar_arrival.classList.add('active');
        taf_arrival.classList.add('active');

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

    } catch (error) {
        showAlert(error)
    }

    //restoring button state
    reports.style.opacity = '1'
    update_wx.style.pointerEvents = 'auto';
    update_wx.style.opacity = "";
    update_wx.style.border = "";
    update_wx.style.backgroundColor = "";
    update_wx.innerHTML = `<svg id='update_icon' fill='currentColor' xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve"><style type="text/css">.st0{opacity:0.2;fill:currentColor;stroke-width:0.05;stroke-miterlimit:10;}</style><g id="grid_system"/><g id="_icons"><g><path d="M12,21c4.9624,0,9-4.0376,9-9c0-0.3784-0.0239-0.7598-0.0708-1.1338c-0.0688-0.5479-0.5698-0.9346-1.1172-0.8672    c-0.5479,0.0688-0.936,0.5688-0.8672,1.1172C18.981,11.4053,19,11.7007,19,12c0,3.8599-3.1401,7-7,7s-7-3.1401-7-7s3.1401-7,7-7    c1.8568,0,3.6179,0.7455,4.9119,2.0166c0.062,0.0613,0.1177,0.1297,0.1776,0.1935c0.0279,0.0295,0.0533,0.0613,0.0806,0.0914    L15.3794,7.624c-0.5435,0.0981-0.9048,0.6182-0.8071,1.1616c0.0874,0.4839,0.5088,0.8228,0.9834,0.8228    c0.0586,0,0.1182-0.0049,0.1782-0.0156l4.1753-0.7524c0.5435-0.0981,0.9048-0.6182,0.8071-1.1616l-0.7524-4.1758    c-0.0986-0.5439-0.6167-0.9058-1.1616-0.8071c-0.5435,0.0981-0.9048,0.6182-0.8071,1.1616l0.3109,1.7251    C16.6447,3.9421,14.4072,3,12,3c-4.9624,0-9,4.0376-9,9S7.0376,21,12,21z"/></g></g></svg>
          <p>UPDATE</p>
    `
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
        var windgusts = `${metar.wind.gust_kts ? metar.wind.gust_kts : "N/A"} knots`;
    } else if (wind_unit == "kilometer_per_hour") {
        var windspeed = `${metar.wind.speed_kph} km/h`;
        var windgusts = `${metar.wind.gust_kph ? metar.wind.gust_kph : "N/A"} km/h`;
    } else if (wind_unit == "mile_per_hour") {
        var windspeed = `${metar.wind.speed_mph} mph`;
        var windgusts = `${metar.wind.gust_mph ? metar.wind.gust_mph : "N/A"} mph`;
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
    const conditions_fetch = metar.conditions?.map(cond => cond.text)
    const conditions = conditions_fetch?.join(', ')

    //constructing decoded METAR string
    let decoded_METAR = `<b>Time of observation:</b> ${time}
    <b>Wind:</b> ${wind_direction}° at ${windspeed}
    <b>Visibility:</b> ${visibility} meters (${visibility_text})
    <b>Temperature:</b> ${temperature}°C
    <b>Dewpoint:</b> ${dewpoint}°C
    <b>Pressure:</b> ${pressure} hPa
    <b>Humidity:</b> ${humidity}%
    <b>Clouds:</b> ${clouds_code} (${clouds_text})`;

    //adding items that may be undefined
    try {
    
    if (metar.wind.gust_kts || metar.wind.gust_kph || metar.wind.gust_mph) {
        decoded_METAR += `
    <b>Wind Gusts:</b> ${windgusts}`;
    }

    if (ceiling != 'undefined feet' && ceiling != 'undefined meters') {
        decoded_METAR += `
    <b>Ceiling:</b> ${ceiling}`;
    } else if (ceiling != 'undefined meters' && ceiling != 'undefined feet') {
        decoded_METAR += `
    <b>Ceiling:</b> ${ceiling}`;
    }

    if (cloud_base) {
        decoded_METAR += `
    <b>Cloud Base:</b> ${cloud_base}`;
    }

    if (conditions) {
        decoded_METAR += `
    <b>Conditions:</b> ${conditions}`;
    }

    } catch (error) {
        showAlert(error) //tST
    }

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

