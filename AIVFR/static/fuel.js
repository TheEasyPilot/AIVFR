import { update, updateSettings, showAlert } from "./basePage.js";
updateSettings("current_page", "/fuel");


//---------------FUEL POLICY TOOLTIP
const policyTooltip = document.getElementById("policyTooltipText");
const policyInfoIcon = document.getElementById("FuelPolicyTooltip");

policyInfoIcon.addEventListener("mouseover", () => {
  policyTooltip.style.display = "block";
});

policyInfoIcon.addEventListener("mouseout", () => {
  policyTooltip.style.display = "none";
});

//---------------FUEL INPUT HANDLING
//user-editable fuel info
const fuelBurn = document.getElementById("fuelBurn");
const taxiTime = document.getElementById("taxiTime");
const maxTankCapacity = document.getElementById("maxTankCapacity");
const specificGravity = document.getElementById("specificGravity");
const extraFuel = document.getElementById("extraFuel");

//fuel required elements
const elements = document.querySelectorAll("#fuel_required .elements");

//totals
const totalFuel = document.getElementById("totalFuel");
const fuelMass = document.getElementById("fuelMass");
const fuelEndurance = document.getElementById("fuelEndurance");

//calculating totals on initial load
await calculateTotals();

//wait for a change in fuel inputs, then update
fuelBurn.addEventListener("change", async () => {
  await update("fuel_burn.value", Number(fuelBurn.value));
  await calculateTotals();
});

taxiTime.addEventListener("change", async () => {
  await update("taxi_time", Number(taxiTime.value));
  await calculateTotals();
});

maxTankCapacity.addEventListener("change", async () => {
  await update("max_tank_capacity.value", Number(maxTankCapacity.value));
}); //no calc needed - max capacity doesnt affect totals

specificGravity.addEventListener("change", async () => {
  await update("specific_gravity", Number(specificGravity.value));
  await calculateTotals();
});

extraFuel.addEventListener("input", async () => {
  await update("fuel_extra.value", Number(extraFuel.value));
  await calculateTotals();
});

//waits for a change in any fuel required element, then calculates all totals
//as one necessitates the other
elements.forEach(element => {
  element.addEventListener("input", async () => {
    await calculateTotals();
  });
});

//------------CALCULATING TOTALS
async function calculateTotals() {
    const response = await fetch("/calculate-totals", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },//send extra fuel value to backend to avoid desync
      body: JSON.stringify({ extra: extraFuel.value }), 
    });
    if (!response.ok) {
      showAlert("Error calculating totals. Please try again.", "error");
      return;
    }
    //fetch updated totals from backend
    const data = await response.json();

    //updating totals
    totalFuel.innerText = `Total: ${data.total_fuel}`;
    fuelMass.innerText = `Mass: ${data.fuel_mass}`;
    fuelEndurance.innerText = `Endurance: ${data.fuel_endurance}`;
}


//---notes for return
//fix issue, then move on to to JS for time allowed calcs. follow notes. we pair each FR with its TA.
//...including taxi time - taxi FR
//then AI.
//isw u better have finished revision before you start ts