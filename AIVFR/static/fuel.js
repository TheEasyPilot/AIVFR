import { update, updateSettings, showAlert } from "./basePage.js";
updateSettings("current_page", "/fuel");

//fuel policy tooltip
const policyTooltip = document.getElementById("policyTooltipText");
const policyInfoIcon = document.getElementById("FuelPolicyTooltip");

policyInfoIcon.addEventListener("mouseover", () => {
  policyTooltip.style.display = "block";
});

policyInfoIcon.addEventListener("mouseout", () => {
  policyTooltip.style.display = "none";
});