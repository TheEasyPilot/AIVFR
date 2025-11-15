//-----Date and time-------------

function updateClock() { //function allows just the time to update smoothly
    const now = new Date(); //gets current date and time

    //local
    const timeLOC = now.toLocaleString([], { hour: '2-digit', minute: '2-digit' }); //displays as hh:mm
    document.getElementById('timeLOC').textContent = timeLOC; //content of this (empty) element set to timeLoc

    //utc
    const timeUTC = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    document.getElementById('timeUTC').textContent = timeUTC;
}

updateClock() //when page loads for first time, run it immediately...
setInterval(updateClock, 1000); //...then update every second.

//----------------------Hovering over a tab when selecting---------------------
//pair each button to their label (as I didn't code them inline with eachother)
const pairs = {
  dashboard: "dashboardLABEL",
  route: "routeLABEL",
  weather: "weatherLABEL",
  navlog: "navLABEL",
  fuel: "fuelLABEL",
  mass_and_balance: "mass_and_balanceLABEL",
  performance: "performanceLABEL"
};

for (let buttonId in pairs) {
  const button = document.getElementById(buttonId);//assign each button with button variable
  const LABEL = document.getElementById(pairs[buttonId]); //assign eachl label with LABEL variable
  const gradient = document.getElementById("NAVoverlay");

  if (button && LABEL) { //For each matching pair run an event listner for it
    button.addEventListener("mouseenter", () => {
      LABEL.style.display = "block";
      gradient.style.display = "block";
    });
    button.addEventListener("mouseleave", () => {
      LABEL.style.display = "none";
      gradient.style.display = "none";
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

//----------------------Updating data---------------------
export async function update(key, value) { //async function allows code to work in quick succession
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

//-------Alert Box--------------
const alertBox = document.getElementById("alertBox");

export function showAlert(message) {
    alertBox.textContent = message;
    alertBox.style.display = "inline";
    setTimeout(() => {
        alertBox.style.display = "none";
        alertBox.textContent = "";
    }, 3000);
}

//--------------------AI Prompting------
export async function prompt(type, text) {
    try {
        const response = await fetch("/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({type: type, text: text}) //sends prompt to backend
      });
  

        if (!response.ok) {
            throw new Error("Network response was not ok"); //for non-200 errors
        }

        const data = await response.json();
        return data;

    } catch (error) {
        showAlert("An Error occured whilst generating the response. Check your connection and try again.");
        return null;
    }
}