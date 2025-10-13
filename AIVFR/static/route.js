

async function update(key, value) { //async function allows code to work in quick succession
    await fetch("/update-flight", { //waits for any running fetch to complete
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({key, value})
    });

    // Mark as unsaved
    if (key !== "saved") {
        await fetch("/update-flight", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({key: "saved", value: "False"})
        });
    }
}

//-------Departure Airport (ICAO)------------
const departureAirport_code = document.getElementById("departure_code");
const departureAirport_name = document.getElementById("departure_name");

departureAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("departureAirport_code", departureAirport_code.value);
        //at this point we validate data and then search for the aerodrome
        await update("departureAirport_name", `airport name for ${departureAirport_code.value}`);
    }
});

//-------Arrival Airport (ICAO)------------

const arrivalAirport_code = document.getElementById("arrival_code");
const arrivalAirport_name = document.getElementById("arrival_name");

arrivalAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("destinationAirport_code", arrivalAirport_code.value);
        //at this point we validate data and then search for the aerodrome
        await update("destinationAirport_name", `airport name for ${arrivalAirport_code.value}`);
    }
});

//-------Alternate Airport (ICAO)------------
const alternateAirport_code = document.getElementById("alternate_code");
const alternateAirport_name = document.getElementById("alternate_name");

alternateAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("alternateAirport_code", alternateAirport_code.value);
        //at this point we validate data and then search for the aerodrome
        await update("alternateAirport_name", `airport name for ${alternateAirport_code.value}`);
    }
});
