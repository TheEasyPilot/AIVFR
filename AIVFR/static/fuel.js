import { update, updateSettings, showAlert, prompt } from "./basePage.js";
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
  await update("specific_gravity.value", Number(specificGravity.value));
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
  const fuel_required_div = document.getElementById("fuel_required");
  fuel_required_div.style.pointerEvents = "none"; //disable inputs during calculation
  fuel_required_div.style.opacity = "0.6";
  //if timeallowd and element type arent provided, its a call to calculate all fuel requireds
  if (timeAllowed == 'None' && elementType == 'None') {
    await calculateFuelRequired(taxiTime.value, "taxi");
    await calculateFuelRequired(TA_trip.value, "trip");
    await calculateFuelRequired(TA_contingency.value, "contingency");
    await calculateFuelRequired(TA_alternate.value, "alternate");
    await calculateFuelRequired(TA_finalReserve.value, "finalReserve");
    await calculateFuelRequired(TA_additional.value, "additional");
    await calculateTotals();

    fuel_required_div.style.pointerEvents = "auto"; //re-enable inputs after calculation
    fuel_required_div.style.opacity = "1";
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
  } else {
    fuel_required_div.style.pointerEvents = "auto"; //re-enable inputs after calculation
    fuel_required_div.style.opacity = "1";
    return
  }
  fuel_required_div.style.pointerEvents = "auto"; //re-enable inputs after calculation
  fuel_required_div.style.opacity = "1";
}

//--------------------------------AI PROMPTING FOR TIME ALLOWED CALCS
const autofillButton = document.getElementById("autofillButton");

autofillButton.addEventListener("click", async () => {
  autofillButton.style.pointerEvents = 'none'; //disable button to prevent multiple clicks
  autofillButton.innerHTML = `<svg fill="currentColor" height="20" id="AI_icon" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7.39804 12.8085C7.57428 12.9328 7.78476 12.9994 8.00043 12.999C8.21633 12.9992 8.42686 12.9317 8.60243 12.806C8.77993 12.6755 8.91464 12.4952 8.98943 12.288L9.43643 10.915C9.55086 10.5707 9.74391 10.2578 10.0003 10.0011C10.2566 9.74436 10.5693 9.55089 10.9134 9.436L12.3044 8.98499C12.4564 8.93064 12.5936 8.84184 12.7055 8.72555C12.8174 8.60926 12.9008 8.46865 12.9492 8.31473C12.9977 8.1608 13.0098 7.99776 12.9847 7.83836C12.9596 7.67897 12.8979 7.52756 12.8044 7.396C12.6703 7.21007 12.4794 7.07283 12.2604 7.005L10.8854 6.558C10.5409 6.44377 10.2278 6.2508 9.97087 5.99441C9.71396 5.73803 9.52035 5.42528 9.40543 5.081L8.95343 3.693C8.88113 3.49069 8.74761 3.31593 8.57143 3.193C8.43877 3.09927 8.28607 3.03779 8.12548 3.01344C7.96489 2.9891 7.80083 3.00256 7.64636 3.05275C7.49188 3.10295 7.35125 3.1885 7.23564 3.3026C7.12004 3.41669 7.03265 3.55619 6.98043 3.71L6.52343 5.11C6.40884 5.44482 6.21967 5.74923 5.97022 6.00025C5.72076 6.25126 5.41753 6.44232 5.08343 6.559L3.69243 7.007C3.54065 7.06139 3.40352 7.15017 3.29177 7.26638C3.18001 7.3826 3.09666 7.5231 3.04824 7.67688C2.99982 7.83067 2.98764 7.99357 3.01265 8.15285C3.03767 8.31213 3.0992 8.46346 3.19243 8.595C3.32027 8.77445 3.50105 8.90942 3.70943 8.981L5.08343 9.42599C5.52354 9.57248 5.90999 9.84682 6.19343 10.214C6.35585 10.4246 6.4813 10.6613 6.56443 10.914L7.01643 12.305C7.08846 12.5083 7.22179 12.6842 7.39804 12.8085ZM13.5353 16.851C13.6713 16.9472 13.8337 16.9989 14.0003 16.999C14.1654 16.9991 14.3264 16.9481 14.4613 16.853C14.6008 16.7545 14.7058 16.6146 14.7613 16.453L15.0093 15.691C15.0625 15.5326 15.1515 15.3885 15.2693 15.27C15.3867 15.1515 15.5307 15.0627 15.6893 15.011L16.4613 14.759C16.619 14.7045 16.7557 14.6021 16.8523 14.466C16.9257 14.363 16.9736 14.2441 16.9921 14.119C17.0106 13.9939 16.9992 13.8662 16.9588 13.7463C16.9184 13.6265 16.8501 13.518 16.7597 13.4296C16.6692 13.3412 16.5591 13.2756 16.4383 13.238L15.6743 12.989C15.5162 12.9365 15.3724 12.8478 15.2544 12.7302C15.1364 12.6125 15.0473 12.469 14.9943 12.311L14.7423 11.538C14.6886 11.3802 14.586 11.2436 14.4493 11.148C14.3473 11.0751 14.2295 11.0271 14.1056 11.0081C13.9816 10.989 13.8549 10.9994 13.7357 11.0383C13.6164 11.0772 13.508 11.1436 13.4192 11.2322C13.3304 11.3207 13.2636 11.4289 13.2243 11.548L12.9773 12.31C12.925 12.4677 12.8375 12.6113 12.7213 12.73C12.6066 12.8465 12.4667 12.9351 12.3123 12.989L11.5393 13.241C11.3803 13.2949 11.2422 13.3975 11.1447 13.5343C11.0472 13.671 10.9952 13.835 10.9961 14.0029C10.997 14.1708 11.0507 14.3342 11.1496 14.47C11.2486 14.6057 11.3877 14.7068 11.5473 14.759L12.3103 15.006C12.4692 15.0594 12.6136 15.1487 12.7323 15.267C12.8505 15.3853 12.939 15.5299 12.9903 15.689L13.2433 16.463C13.2981 16.6195 13.4001 16.7551 13.5353 16.851Z" fill="currentColor"/></svg>GENERATING...`

  const response = await fetch('/get-flight');
  const flightData = await response.json();

  //constructing prompt with relevant flight data
  const promptText = `
  POLICY DESCRIPTIONS:
  Trip: ${tripPolicy.value}
  Contingency: ${contingencyPolicy.value}
  Alternate: ${alternatePolicy.value}
  Final Reserve: ${finalReservePolicy.value}
  Additional: ${additionalPolicy.value}

  RELEVANT FLIGHT DATA:
  Departure Airport: ${flightData.departureAirport_name}
  Arrival Airport: ${flightData.destinationAirport_name}
  Alternate Airport: ${flightData.alternateAirport_name}
  Distance: ${flightData.distance.output}
  Time Enroute: ${flightData.time}
  `;

  const aiResponse = await prompt("Fuel", promptText);  
  try {
      const resp = JSON.parse(aiResponse); //parsing the response to JSON
      var times = resp.times; //extracting times object

  } catch (error) {
      console.log(error);
      showAlert("An error occured whilst generating times. Please ensure you have created a route and filled out the navlog, then try again.");
      autofillButton.disabled = false;
      autofillButton.innerHTML = `<svg fill="currentColor" height="20" id="AI_icon" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7.39804 12.8085C7.57428 12.9328 7.78476 12.9994 8.00043 12.999C8.21633 12.9992 8.42686 12.9317 8.60243 12.806C8.77993 12.6755 8.91464 12.4952 8.98943 12.288L9.43643 10.915C9.55086 10.5707 9.74391 10.2578 10.0003 10.0011C10.2566 9.74436 10.5693 9.55089 10.9134 9.436L12.3044 8.98499C12.4564 8.93064 12.5936 8.84184 12.7055 8.72555C12.8174 8.60926 12.9008 8.46865 12.9492 8.31473C12.9977 8.1608 13.0098 7.99776 12.9847 7.83836C12.9596 7.67897 12.8979 7.52756 12.8044 7.396C12.6703 7.21007 12.4794 7.07283 12.2604 7.005L10.8854 6.558C10.5409 6.44377 10.2278 6.2508 9.97087 5.99441C9.71396 5.73803 9.52035 5.42528 9.40543 5.081L8.95343 3.693C8.88113 3.49069 8.74761 3.31593 8.57143 3.193C8.43877 3.09927 8.28607 3.03779 8.12548 3.01344C7.96489 2.9891 7.80083 3.00256 7.64636 3.05275C7.49188 3.10295 7.35125 3.1885 7.23564 3.3026C7.12004 3.41669 7.03265 3.55619 6.98043 3.71L6.52343 5.11C6.40884 5.44482 6.21967 5.74923 5.97022 6.00025C5.72076 6.25126 5.41753 6.44232 5.08343 6.559L3.69243 7.007C3.54065 7.06139 3.40352 7.15017 3.29177 7.26638C3.18001 7.3826 3.09666 7.5231 3.04824 7.67688C2.99982 7.83067 2.98764 7.99357 3.01265 8.15285C3.03767 8.31213 3.0992 8.46346 3.19243 8.595C3.32027 8.77445 3.50105 8.90942 3.70943 8.981L5.08343 9.42599C5.52354 9.57248 5.90999 9.84682 6.19343 10.214C6.35585 10.4246 6.4813 10.6613 6.56443 10.914L7.01643 12.305C7.08846 12.5083 7.22179 12.6842 7.39804 12.8085ZM13.5353 16.851C13.6713 16.9472 13.8337 16.9989 14.0003 16.999C14.1654 16.9991 14.3264 16.9481 14.4613 16.853C14.6008 16.7545 14.7058 16.6146 14.7613 16.453L15.0093 15.691C15.0625 15.5326 15.1515 15.3885 15.2693 15.27C15.3867 15.1515 15.5307 15.0627 15.6893 15.011L16.4613 14.759C16.619 14.7045 16.7557 14.6021 16.8523 14.466C16.9257 14.363 16.9736 14.2441 16.9921 14.119C17.0106 13.9939 16.9992 13.8662 16.9588 13.7463C16.9184 13.6265 16.8501 13.518 16.7597 13.4296C16.6692 13.3412 16.5591 13.2756 16.4383 13.238L15.6743 12.989C15.5162 12.9365 15.3724 12.8478 15.2544 12.7302C15.1364 12.6125 15.0473 12.469 14.9943 12.311L14.7423 11.538C14.6886 11.3802 14.586 11.2436 14.4493 11.148C14.3473 11.0751 14.2295 11.0271 14.1056 11.0081C13.9816 10.989 13.8549 10.9994 13.7357 11.0383C13.6164 11.0772 13.508 11.1436 13.4192 11.2322C13.3304 11.3207 13.2636 11.4289 13.2243 11.548L12.9773 12.31C12.925 12.4677 12.8375 12.6113 12.7213 12.73C12.6066 12.8465 12.4667 12.9351 12.3123 12.989L11.5393 13.241C11.3803 13.2949 11.2422 13.3975 11.1447 13.5343C11.0472 13.671 10.9952 13.835 10.9961 14.0029C10.997 14.1708 11.0507 14.3342 11.1496 14.47C11.2486 14.6057 11.3877 14.7068 11.5473 14.759L12.3103 15.006C12.4692 15.0594 12.6136 15.1487 12.7323 15.267C12.8505 15.3853 12.939 15.5299 12.9903 15.689L13.2433 16.463C13.2981 16.6195 13.4001 16.7551 13.5353 16.851Z" fill="currentColor"/></svg>AUTOFILL`;
      return;
  }

  //updating inputs with generated times
  TA_trip.value = times[0]
  TA_contingency.value = times[1]
  TA_alternate.value = times[2]
  TA_finalReserve.value = times[3]
  TA_additional.value = times[4]

//update session data and recalculate fuel requireds
  await update("fuelPolicy_trip.time_allowed", Number(TA_trip.value));
  await update("fuelPolicy_contingency.time_allowed", Number(TA_contingency.value));
  await update("fuelPolicy_alternate.time_allowed", Number(TA_alternate.value));
  await update("fuelPolicy_finalReserve.time_allowed", Number(TA_finalReserve.value));
  await update("fuelPolicy_additional.time_allowed", Number(TA_additional.value));
  await calculateFuelRequired();

  autofillButton.style.pointerEvents = 'auto';
  autofillButton.innerHTML = `<svg fill="currentColor" height="20" id="AI_icon" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7.39804 12.8085C7.57428 12.9328 7.78476 12.9994 8.00043 12.999C8.21633 12.9992 8.42686 12.9317 8.60243 12.806C8.77993 12.6755 8.91464 12.4952 8.98943 12.288L9.43643 10.915C9.55086 10.5707 9.74391 10.2578 10.0003 10.0011C10.2566 9.74436 10.5693 9.55089 10.9134 9.436L12.3044 8.98499C12.4564 8.93064 12.5936 8.84184 12.7055 8.72555C12.8174 8.60926 12.9008 8.46865 12.9492 8.31473C12.9977 8.1608 13.0098 7.99776 12.9847 7.83836C12.9596 7.67897 12.8979 7.52756 12.8044 7.396C12.6703 7.21007 12.4794 7.07283 12.2604 7.005L10.8854 6.558C10.5409 6.44377 10.2278 6.2508 9.97087 5.99441C9.71396 5.73803 9.52035 5.42528 9.40543 5.081L8.95343 3.693C8.88113 3.49069 8.74761 3.31593 8.57143 3.193C8.43877 3.09927 8.28607 3.03779 8.12548 3.01344C7.96489 2.9891 7.80083 3.00256 7.64636 3.05275C7.49188 3.10295 7.35125 3.1885 7.23564 3.3026C7.12004 3.41669 7.03265 3.55619 6.98043 3.71L6.52343 5.11C6.40884 5.44482 6.21967 5.74923 5.97022 6.00025C5.72076 6.25126 5.41753 6.44232 5.08343 6.559L3.69243 7.007C3.54065 7.06139 3.40352 7.15017 3.29177 7.26638C3.18001 7.3826 3.09666 7.5231 3.04824 7.67688C2.99982 7.83067 2.98764 7.99357 3.01265 8.15285C3.03767 8.31213 3.0992 8.46346 3.19243 8.595C3.32027 8.77445 3.50105 8.90942 3.70943 8.981L5.08343 9.42599C5.52354 9.57248 5.90999 9.84682 6.19343 10.214C6.35585 10.4246 6.4813 10.6613 6.56443 10.914L7.01643 12.305C7.08846 12.5083 7.22179 12.6842 7.39804 12.8085ZM13.5353 16.851C13.6713 16.9472 13.8337 16.9989 14.0003 16.999C14.1654 16.9991 14.3264 16.9481 14.4613 16.853C14.6008 16.7545 14.7058 16.6146 14.7613 16.453L15.0093 15.691C15.0625 15.5326 15.1515 15.3885 15.2693 15.27C15.3867 15.1515 15.5307 15.0627 15.6893 15.011L16.4613 14.759C16.619 14.7045 16.7557 14.6021 16.8523 14.466C16.9257 14.363 16.9736 14.2441 16.9921 14.119C17.0106 13.9939 16.9992 13.8662 16.9588 13.7463C16.9184 13.6265 16.8501 13.518 16.7597 13.4296C16.6692 13.3412 16.5591 13.2756 16.4383 13.238L15.6743 12.989C15.5162 12.9365 15.3724 12.8478 15.2544 12.7302C15.1364 12.6125 15.0473 12.469 14.9943 12.311L14.7423 11.538C14.6886 11.3802 14.586 11.2436 14.4493 11.148C14.3473 11.0751 14.2295 11.0271 14.1056 11.0081C13.9816 10.989 13.8549 10.9994 13.7357 11.0383C13.6164 11.0772 13.508 11.1436 13.4192 11.2322C13.3304 11.3207 13.2636 11.4289 13.2243 11.548L12.9773 12.31C12.925 12.4677 12.8375 12.6113 12.7213 12.73C12.6066 12.8465 12.4667 12.9351 12.3123 12.989L11.5393 13.241C11.3803 13.2949 11.2422 13.3975 11.1447 13.5343C11.0472 13.671 10.9952 13.835 10.9961 14.0029C10.997 14.1708 11.0507 14.3342 11.1496 14.47C11.2486 14.6057 11.3877 14.7068 11.5473 14.759L12.3103 15.006C12.4692 15.0594 12.6136 15.1487 12.7323 15.267C12.8505 15.3853 12.939 15.5299 12.9903 15.689L13.2433 16.463C13.2981 16.6195 13.4001 16.7551 13.5353 16.851Z" fill="currentColor"/></svg>AUTOFILL`;
});
