const showNavlogPDFButton = document.getElementById('showNavlogPDF');
const showBasePDFButton = document.getElementById('showBasePDF');
const navlogPDFTemplate = document.getElementById('navlogPDF_template');
const basePDFTemplate = document.getElementById('BasePDF_template');

function updateSettings(key, value) { //to update the settings in the session
        return fetch("/update-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value})
    });
}

if (showNavlogPDFButton && showBasePDFButton && navlogPDFTemplate && basePDFTemplate) {
    showNavlogPDFButton.addEventListener('click', () => {
        if (navlogPDFTemplate.style.display === 'none') {
            navlogPDFTemplate.style.display = 'block';
            basePDFTemplate.style.display = 'none';
        } else {
            navlogPDFTemplate.style.display = 'none';
        }
    });

    showBasePDFButton.addEventListener('click', () => {
        if (basePDFTemplate.style.display === 'none') {
            basePDFTemplate.style.display = 'block';
            navlogPDFTemplate.style.display = 'none';
        } else {
            basePDFTemplate.style.display = 'none';
        }
    });
}
else {
    console.error('One or more PDF elements not found');
}

// Set viewing_pdf to False when the user leaves the page

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        updateSettings('viewing_pdf', "False");
    }
    else if (document.visibilityState === 'visible') {
        updateSettings('viewing_pdf', "True");
    }
});

window.addEventListener('beforeunload', function (e) {
    updateSettings('viewing_pdf', "False");
});