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

//Hovering over a tab when selecting---------------------

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
  const button = document.getElementById(buttonId);
  const LABEL = document.getElementById(pairs[buttonId]);

  if (button && LABEL) {
    button.addEventListener("mouseenter", () => {
      LABEL.style.display = "block";
    });
    button.addEventListener("mouseleave", () => {
      LABEL.style.display = "none";
    });
  }
}
