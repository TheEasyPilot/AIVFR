async function update(key, value) { //async function allows code to work in quick succession
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

//------SAVE BUTTON-------

const saveButton = document.getElementById("save");

saveButton.addEventListener("click", () => {
    saveButton.classList.add("savingOrSaved");
    saveButton.textContent = "SAVING...";
    
    /*save flight algorithm here*/
    //when done:
    update("saved", "True");

    setTimeout(() => {
        saveButton.textContent = "SAVED";
    }, 2000); //2 seconds
    
})