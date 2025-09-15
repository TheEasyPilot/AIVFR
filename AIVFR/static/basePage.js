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
  "m&b": "mass_and_balanceLABEL",
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
  }
}

