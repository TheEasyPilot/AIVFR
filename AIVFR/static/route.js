const departure_code = document.getElementById("departure_code");
const departure_name = document.getElementById("departure_name");
const distance = document.getElementById("distance")

async function update(key, value) { //async function allows code to work in quick succession
    await fetch("/update-flight", { //waits for any running fetch to complete
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value, saved: "False" })
    });
}

departure_code.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("departure_code", departure_code.value);
        //at this point we validate data and then search for the aerodrome
        await update("departure_name", `airport name for ${departure_code.value}`);
    }
});

//-------TESTING------------
distance.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await update("distance", distance.value);
        //at this point we validate data and then search for the aerodrome
        await update("distance_output", `${distance.value}`);
    }
});

//when changing the units we need to go to python and code the change
//then in JS we should plug the class name into the function??? then that runs and converts all
