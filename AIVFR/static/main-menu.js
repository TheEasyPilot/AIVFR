//ensuring the HTML has loaded properly before runing the script
document.addEventListener("DOMContentLoaded", function() {
    console.log("JS LOADED") //confirming the script has now loaded

    //-----Check for theme----
    const root = document.documentElement
    fetch("http://127.0.0.1:5000/get-settings") //fetches the current session data
    .then(response => response.json()) //turns it into a .json file so it can be read
    .then(settings => {
        if (settings.theme === "dark") {
            root.classList.add("dark-mode");
        } else {
            root.classList.remove("dark-mode");
        }
    });

    //linking the buttons and disclaimer to the script
    var disclaimer = document.getElementById("disclaimer");
    var Continue = document.getElementById("continue");
    var loadFlight = document.getElementById("loadFlight");
    var newFlight = document.getElementById("newFlight");
    var disclaimerContinue = document.getElementById("disclaimerACCEPT");
    var disclaimerGoBack = document.getElementById("disclaimerEXIT");

    //display the disclaimer
    function displayDisclaimer() { 
    disclaimer.style.display = "block";
    }

    Continue.addEventListener("click", function() {
        displayDisclaimer();
        ContinueFlight(); //determines what happens if the user presses continue on disclaimer
        
    });

    loadFlight.addEventListener("click", function() {
        displayDisclaimer();
    });

    newFlight.addEventListener("click", function() {
        displayDisclaimer();
    });

    //disclaimer
    disclaimerGoBack.onclick = function() {
    disclaimer.style.display = "none";
    }

    //---------------------------Continue, load, make new flight
    
    function ContinueFlight() {
        disclaimerContinue.onclick = function() {
            window.open("dashboard", '_self')
        }
    }
    
});




