import { update, updateSettings, showAlert } from "./basePage.js";
await updateSettings("current_page", "/fuel");
//-----------------UNITS CHECK--------------
//units here must match. if the vol is l, mass must be kg.
//if vol is US liquid gallon, mass must be lbs
fetch('/get-all')
.then(response => response.json())
.then(async data => {
    const base_units = data.settings.base_units;

    if (base_units === "custom") {
      showAlert("Please ensure that mass and volume units match when using customised units.");
    }
});


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
  await calculateFuelRequired();
});

taxiTime.addEventListener("change", async () => {
  await update("taxi_time", Number(taxiTime.value));
  await calculateFuelRequired(taxiTime.value, "taxi");
  await calculateTotals();
});

maxTankCapacity.addEventListener("change", async () => {
  await update("max_tank_capacity.value", Number(maxTankCapacity.value));
  await calculateTotals();
});

specificGravity.addEventListener("change", async () => {
  await update("specific_gravity", Number(specificGravity.value));
  await calculateTotals();
});

extraFuel.addEventListener("input", async () => {
  await update("fuel_extra.value", Number(extraFuel.value));
  await calculateTotals();
});

//------------CALCULATING TOTALS
async function calculateTotals() {
    const response = await fetch("/calculate-totals", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },//send extra fuel value to backend to avoid desync
      body: JSON.stringify({ extra: Number(extraFuel.value) }), 
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

    //handling stopover alert
    const stopoverRequired = document.getElementById("stopoverRequired");
    const stopoverNotRequired = document.getElementById("stopoverNotRequired");

    if (data.stopover_status == true) {
      stopoverRequired.style.display = "block";
      stopoverNotRequired.style.display = "none";
    } else {
      stopoverRequired.style.display = "none";
      stopoverNotRequired.style.display = "block";
    }
}

//----------------------------FUEL POLICY INPUT HANDLING
const tripPolicy = document.getElementById("tripPolicy");
const TA_trip = document.getElementById("TA_trip");

const contingencyPolicy = document.getElementById("contingencyPolicy");
const TA_contingency = document.getElementById("TA_contingency");

const alternatePolicy = document.getElementById("alternatePolicy");
const TA_alternate = document.getElementById("TA_alternate");

const finalReservePolicy = document.getElementById("finalReservePolicy");
const TA_finalReserve = document.getElementById("TA_finalReserve");

const additionalPolicy = document.getElementById("additionalPolicy");
const TA_additional = document.getElementById("TA_additional");

//-------------------updating fuel policy selections

tripPolicy.addEventListener("change", async () => {
  await update("fuelPolicy_trip.policy", tripPolicy.value);
});

contingencyPolicy.addEventListener("change", async () => {
  await update("fuelPolicy_contingency.policy", contingencyPolicy.value);
});

alternatePolicy.addEventListener("change", async () => {
  await update("fuelPolicy_alternate.policy", alternatePolicy.value);
});

finalReservePolicy.addEventListener("change", async () => {
  await update("fuelPolicy_finalReserve.policy", finalReservePolicy.value);
});

additionalPolicy.addEventListener("change", async () => {
  await update("fuelPolicy_additional.policy", additionalPolicy.value);
});

//--------------------updating time allowed inputs and calculating fuel required
TA_trip.addEventListener("change", async () => {
  await update("fuelPolicy_trip.time_allowed", Number(TA_trip.value));
  await calculateFuelRequired(TA_trip.value, "trip");
  await calculateTotals();
});

TA_contingency.addEventListener("change", async () => {
  await update("fuelPolicy_contingency.time_allowed", Number(TA_contingency.value));
  await calculateFuelRequired(TA_contingency.value, "contingency");
  await calculateTotals();
});

TA_alternate.addEventListener("change", async () => {
  await update("fuelPolicy_alternate.time_allowed", Number(TA_alternate.value));
  await calculateFuelRequired(TA_alternate.value, "alternate");
  await calculateTotals();
});

TA_finalReserve.addEventListener("change", async () => {
  await update("fuelPolicy_finalReserve.time_allowed", Number(TA_finalReserve.value));
  await calculateFuelRequired(TA_finalReserve.value, "finalReserve");
  await calculateTotals();
});

TA_additional.addEventListener("change", async () => {
  await update("fuelPolicy_additional.time_allowed", Number(TA_additional.value));
  await calculateFuelRequired(TA_additional.value, "additional");
  await calculateTotals();
});

//----------------------FUEL REQUIRED CALCULATIONS
async function calculateFuelRequired(timeAllowed='None', elementType='None') {
  //if timeallowd and element type arent provided, its a call to calculate all fuel requireds
  if (timeAllowed == 'None' && elementType == 'None') {
    await calculateFuelRequired(taxiTime.value, "taxi");
    await calculateFuelRequired(TA_trip.value, "trip");
    await calculateFuelRequired(TA_contingency.value, "contingency");
    await calculateFuelRequired(TA_alternate.value, "alternate");
    await calculateFuelRequired(TA_finalReserve.value, "finalReserve");
    await calculateFuelRequired(TA_additional.value, "additional");
    await calculateTotals();
    return;
  }

  //get values from inputs
  const burn = Number(fuelBurn.value);
  const element = document.getElementById(`fuel_${elementType}`);
  
  //calculate fuel required
  if (fuelBurn.value != "" && timeAllowed != "") {
  const fuel_required = (Number(timeAllowed) / 60) * burn

  //update session data and units
  await update(`fuel_${elementType}.value`, fuel_required);
  await fetch('/units-update')

  //get updated value from backend
    fetch('/get-flight')
    .then(response => response.json())
    .then(async data => {
      //update the element with the new value from backend
        const updatedValue = data[`fuel_${elementType}`].output;
        element.innerText = updatedValue;
  });
  } else {return}
}