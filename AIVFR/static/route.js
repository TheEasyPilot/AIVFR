const departureAirport_code = document.getElementById("departure_code");
const departureAirport_name = document.getElementById("departure_name");
const distanceINP = document.getElementById("distanceINP")

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

departureAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("departureAirport_code", departureAirport_code.value);
        //at this point we validate data and then search for the aerodrome
        await update("departureAirport_name", `airport name for ${departureAirport_code.value}`);
    }
});

//-------TESTING------------
distanceINP.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("distance", {class: "distance", value: Number(distanceINP.value),});
        fetch('/units-update')
    }
});
