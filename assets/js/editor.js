import { auth, db } from "./app";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Extract the Project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("project");

// Ensure a project ID exists
if (!projectId) {
    alert("No project selected. Redirecting to dashboard...");
    window.location.href = "dashboard.html"; // Redirect if no project found
}

// Function to load saved lower third settings
async function loadProjectSettings() {
    const user = auth.currentUser;
    if (!user) return;

    const projectRef = doc(db, "users", user.uid, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
        const settings = projectSnap.data();
        console.log("🎨 Loaded settings:", settings);

        // Apply saved settings to the editor
        document.getElementById("text1").value = settings.text1 || "John Smith";
        document.getElementById("text2").value = settings.text2 || "Graphic Designer, Simple Thirds";
        document.getElementById("fontSelector").value = settings.font || "Roboto";
        document.getElementById("bgColor").value = settings.bgColor || "#154c79";
        // Add more fields as needed...
    } else {
        console.log("⚠ No saved settings for this project, using defaults.");
    }
}

// Call function to load settings when the page loads
auth.onAuthStateChanged(user => {
    if (user) {
        loadProjectSettings();
    }
});
// Function to save the current lower third settings to Firestore
async function saveProjectSettings() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be signed in to save changes.");
        return;
    }

    const lowerThirdId = urlParams.get("lowerThird"); // Get lower third ID from the URL
    if (!lowerThirdId) {
        alert("No lower third selected. Cannot save.");
        return;
    }

    const lowerThirdRef = doc(db, "users", user.uid, "projects", projectId, "lowerThirds", lowerThirdId);

    // Collect the current editor settings
    const settings = {
        text1: document.getElementById("text1").value,
        text2: document.getElementById("text2").value,
        text3: document.getElementById("text3").value,
        font1: document.getElementById("fontFamily1").value,
        font2: document.getElementById("fontFamily2").value,
        font3: document.getElementById("fontFamily3").value,
        fontSize1: document.getElementById("fontSize1").value,
        fontSize2: document.getElementById("fontSize2").value,
        fontSize3: document.getElementById("fontSize3").value,
        fontColor: document.getElementById("fontColor").value,
        bgColor: document.getElementById("bgColor").value,
        bgOpacity: document.getElementById("bgOpacity").value,
        rectHeight: document.getElementById("rectHeight").value,
        textAlignment: document.getElementById("textAlignment").value,
        textMargin: document.getElementById("textMargin").value,
        leftCrop: document.getElementById("leftCrop").value,
        rightCrop: document.getElementById("rightCrop").value,
        roundedEdges: document.getElementById("roundedEdges").value
    };

    try {
        await setDoc(lowerThirdRef, settings, { merge: true });
        console.log("✅ Lower Third settings saved successfully.");
        alert("✅ Lower Third settings have been saved!");
    } catch (error) {
        console.error("❌ Error saving project settings:", error);
        alert("❌ Error saving Lower Third. Please try again.");
    }
}

// Ensure Save Button is Linked Correctly
document.getElementById("saveProjectButton").addEventListener("click", saveProjectSettings);

// Attach the save function to UI changes
document.getElementById("text1").addEventListener("input", saveProjectSettings);
document.getElementById("text2").addEventListener("input", saveProjectSettings);
document.getElementById("fontSelector").addEventListener("change", saveProjectSettings);
document.getElementById("bgColor").addEventListener("input", saveProjectSettings);

// Allows users to return to the dashboard from the editor
window.returnToDashboard = function () {
    if (confirm("Are you sure you want to return to the Dashboard? Make sure you've saved your changes!")) {
        window.location.href = "dashboard.html";
    }
};
d;