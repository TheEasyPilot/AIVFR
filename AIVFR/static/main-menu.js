//ensuring the HTML has loaded properly before runing the script
document.addEventListener("DOMContentLoaded", function() {
    //linking the buttons and disclaimer to the script
    const uploadFlight = document.getElementById("uploadFlight");
    const disclaimer = document.getElementById("disclaimer");
    const Continue = document.getElementById("continue");
    const loadFlight = document.getElementById("loadFlight");
    const newFlight = document.getElementById("newFlight");
    const disclaimerContinue = document.getElementById("disclaimerACCEPT");
    const disclaimerGoBack = document.getElementById("disclaimerEXIT");
    const uploadFlightGoBack = document.getElementById("uploadFlightEXIT");

    function updateSettings(key, value) {
        fetch("/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value})
    });
    }

    updateSettings("current_page", "/");

    //display the disclaimer
    function displayDisclaimer() { 
    disclaimer.style.display = "block";
    }

    //display the upload flight modal
    function displayUploadFlight() {
    uploadFlight.style.display = "block";
    }

    Continue.addEventListener("click", function() {
        displayDisclaimer();
        ContinueFlight(); //determines what happens if the user presses continue on disclaimer
    });

    loadFlight.addEventListener("click", function() {
        displayDisclaimer();
        disclaimerContinue.onclick = function() {
            disclaimer.style.display = "none";
            displayUploadFlight();
            }
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

    //upload flight
    uploadFlightGoBack.onclick = function() {
    uploadFlight.style.display = "none";
    }

    //---------------------------CONTINUE FLIGHT
    
    function ContinueFlight() {
        disclaimerContinue.onclick = function() {
            window.open("dashboard", '_self')
            }
        }
    });

    //---------------------------NEW FLIGHT
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
    }

    //---------------------------LOAD FLIGHT

    uploadFlightForm.addEventListener('submit', function(event) {
        uploadStatus.textContent = ""; 
        uploadStatus.textContent = "Uploading...";
        
        event.preventDefault(); //prevent the default form submission (so the URL doesn't change)
        loadSession(); //call the function to load the session
    });

    async function loadSession() {
        const input = document.getElementById('flightFile');

         //check if a file has been selected
        if (!input.files.length) return uploadStatus.textContent = "Please select a file to upload.";

        //read the file as text
        const file = input.files[0];
        const text = await file.text();
        let flightData;
        try {
            flightData = JSON.parse(text); //parse the text as JSON
        } catch (error) { //return an error if the file is not valid JSON
            return uploadStatus.textContent = "Invalid file format. Please upload a valid JSON file.";
        }

        //send the flight data to the server
        const response = await fetch('/load-flight', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(flightData)
        });

        if (response.ok) { //check if the response is okay (it passed the server-side validation)
            uploadStatus.style.color = "green";
            uploadStatus.textContent = "Flight loaded successfully, redirecting to dashboard...";
            setTimeout(() => {
                window.open("dashboard", '_self'); //redirect to dashboard after a short delay
            }, 1000);
        }  else { //if the response is not okay, display the error message from the server
            const errorData = await response.json();
            uploadStatus.style.color = "red";
            uploadStatus.textContent = errorData.error || "An error occurred while loading the flight."; //latter should always show
        }
    }

    //saves the name of the uploaded file to display in the popup
    document.getElementById('flightFile').addEventListener('change', function() {
    var fileName = this.files[0] ? this.files[0].name : '';
    document.getElementById('fileName').textContent = fileName;
    });

