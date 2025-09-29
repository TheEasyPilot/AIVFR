//ensuring the HTML has loaded properly before runing the script
document.addEventListener("DOMContentLoaded", function() {
    console.log("JS LOADED") //confirming the script has now loaded
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
        NewFlight();
        disclaimerContinue.onclick = function() {
        clearSession();
        window.open("dashboard", '_self')
        };
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

    function NewFlight() {
        fetch('/get-flight')
        .then(response => response.json())
        .then(data => {
        if (data.saved == "False") { //checks if current flight data is saved
            alert("Your Flight Plan has changes that have not yet been saved onto your device. By pressing 'Continue' on the disclaimer, The current flight data will be erased, which is irreversable!")
            }
        })
    };

    function clearSession() {
        fetch('/new-flight')
        console.log('here')
    }

