const departureAirport_code = document.getElementById("departure_code");
const departureAirport_name = document.getElementById("departure_name");
const distance = document.getElementById("distance")

async function update(key, value) { //async function allows code to work in quick succession
    await fetch("/update-flight", { //waits for any running fetch to complete
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, saved: "False" })
    });
}

departureAirport_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("departureAirport_code", departureAirport_code.value);
        //at this point we validate data and then search for the aerodrome
        await update("departureAirport_name", `airport name for ${departureAirport_code.value}`);
        //ERROR - NOTHING WIL UPDATE WHEN ENTER PRESSED. VALUE NEEDS TO BE UPDATED ONLY??
    }
});

//-------TESTING------------
distance.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("distance.value", int(distance.value));
    }
});

//when changing the units we need to go to python and code the change
//then in JS we should plug the class name into the function??? then that runs and converts all
