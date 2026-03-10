//=============DATE AND TIME=============

function updateClock() { //function allows just the time to update smoothly
    const now = new Date(); //gets current date and time

    //local
    const timeLOC = now.toLocaleString([], { hour: '2-digit', minute: '2-digit' }); //displays as hh:mm
    document.getElementById('timeLOC').textContent = timeLOC; //content of this (empty) element set to timeLoc

    //utc
    const timeUTC = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }); //same as local but with time zone set to UTC and 24hr format
    document.getElementById('timeUTC').textContent = timeUTC; //content of this (empty) element set to timeUTC
}

updateClock() //when page loads for first time, run it immediately...
setInterval(updateClock, 1000); //...then update every second.

//===================NAVIGATION BAR====================

//-------Hovering over a tab when selecting----------
//pair each button to their label (as I didn't code them inline with eachother)
const pairs = {
  dashboard: "dashboardLABEL",
  route: "routeLABEL",
  weather: "weatherLABEL",
  navlog: "navLABEL",
  fuel: "fuelLABEL",
  mass_and_balance: "mass_and_balanceLABEL",
  performance: "performanceLABEL",
  settings: "settingsLABEL"
};

for (let buttonId in pairs) {
  const button = document.getElementById(buttonId);//assign each button with button variable
  const LABEL = document.getElementById(pairs[buttonId]); //assign each label with LABEL variable
  const gradient = document.getElementById("NAVoverlay"); //the dark gradient overlay that appears when hovering over any button, to make the label more visible

  if (button && LABEL) { //For each matching pair run an event listner for it
    button.addEventListener("mouseenter", () => {
      LABEL.style.visibility = "visible"; //when mouse enters button, make label and gradient visible
      LABEL.style.opacity = "1"; //fade in effect for label
      gradient.style.visibility = "visible"; //same for gradient
      gradient.style.opacity = "1"; //fade in effect for gradient
    });
    button.addEventListener("mouseleave", () => {
      LABEL.style.visibility = "hidden"; //when mouse leaves button, make label and gradient hidden again
      LABEL.style.opacity = "0"; //fade oyut effect for label
      gradient.style.visibility = "hidden";
      gradient.style.opacity = "0"; //fade out effect for gradient
    });

    //---------selecting another page---------------
    button.addEventListener("click" , () => {
      if (buttonId == "mass_and_balance") {
        window.open("mass-and-balance", '_self') //if statement avoids syntax URL error
      } else {
        window.open(`${buttonId}`, '_self') //uses the button ID which matches the webpage name
      }
    });
  }
}

//===================UPDATING DATA===================
export async function update(key, value) { //async function allows code to work in quick succession
    await fetch("/update-flight", { //waits for any running fetch to complete
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({key, value}) //sends the key and value to the backend
    });

    // Mark as unsaved
    if (key !== "saved_json" && key !== "saved_pdf") { 
      //if the update is not for updating the file saved status, mark both as unsaved (as it must be a change to the flight data)
        await update("saved_json", false);
        await update("saved_pdf", false);
    }
}

//===================UPDATING SETTINGS===================

export async function updateSettings(key, value) { //similar to update function but for settings, which is stored separately in the backend
        await fetch("/update-settings", {//waits for any running fetch to complete
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value}) //sends the key and value to the backend
    });
}


//===================ALERT BOX===================
const alertBox = document.getElementById("alertBox");

export async function showAlert(message) {
    alertBox.textContent = message; //set the message of the alert box to the message passed into the function
    alertBox.style.visibility = "visible"; //make the alert box visible
    alertBox.style.transform = "translateY(7px) translateX(-50%)"; //slide down effect
    alertBox.style.opacity = "1"; //fade in effect
    setTimeout(async () => {
      alertBox.style.transform = "translateY(-7px) translateX(-50%)"; //slide up effect
      alertBox.style.visibility = "hidden"; //make the alert box hidden again (after sliding up so it doesn't disappear before the animation completes)
      alertBox.style.opacity = "0"; //fade out effect

      //wait for opacity transition to complete before clearing the text,
      //so that if a new alert is triggered immediately after, the text doesn't disappear before the new message can be set
      await new Promise(resolve => setTimeout(resolve, 500)); 
      alertBox.textContent = "";
    }, 5000);
}

//===================AI PROMPTING===================
export async function prompt(type, text) {
    try {
        const response = await fetch("/prompt", { //
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({type: type, text: text}) //sends prompt to backend
      });

        if (!response.ok) {
                throw new Error("Network response was not ok"); //for non-200 errors (invalid code, API error, etc.)
            }

        const data = await response.json();
        return data.response; //contains the full response

    //error handling for fetch failures and non-200 responses
    } catch (error) {
        console.log(error);
        //alert feedback to the user if if something goes wrong
        showAlert("An Error occured whilst generating the response. Check your connection and try again.");
        return null;
    }
}