import { db, auth } from "./app.js";
import { collection, doc, addDoc, getDoc, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Function to Load Project Data and Lower Thirds
async function loadProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("project");
    if (!projectId) {
        alert("Invalid project.");
        window.location.href = "dashboard.html";
        return;
    }

    const user = auth.currentUser;
    if (!user) return;

    // Get Project Name from Firestore
    const projectRef = doc(db, "users", user.uid, "projects", projectId);
    const projectSnap = await getDoc(projectRef);

    if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        document.getElementById("project-name").textContent = projectData.name; // Display Project Name
    } else {
        alert("Project not found.");
        window.location.href = "dashboard.html";
        return;
    }

    // Fetch Lower Thirds inside the Project
    await displayLowerThirds(user.uid, projectId);
}

// create function
async function createNewLowerThird() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be signed in to create a new lower third.");
        return;
    }

    const projectId = new URLSearchParams(window.location.search).get("project");
    if (!projectId) {
        Toastify({
            text: ("Invalid project. Please try again."),
            position: "center",
            newWindow: true,
            close: true,
            style: {
                background: "linear-gradient(to right,rgb(176, 0, 0),rgb(201, 94, 61))",
              },
            duration: 3000,
        }).showToast();
        return;
    }

    const lowerThirdName = document.getElementById('itemName').value;
    if (!lowerThirdName) return;

    try {
        const lowerThirdsRef = collection(db, "users", user.uid, "projects", projectId, "lowerThirds");
        await addDoc(lowerThirdsRef, {
            name: lowerThirdName,
            createdAt: new Date()
        });
        $('#createItemModal').modal('hide');
        Toastify({
            text: (`Lower Third "${lowerThirdName}" has been added.`),
            position: "center",
            newWindow: true,
            close: true,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              },
            duration: 3000,
        }).showToast();
        displayLowerThirds(user.uid, projectId);
    } catch (error) {
        console.error("❌ Error creating Lower Third:", error);
        alert("Error creating Lower Third. Please try again.");
    }
}
// Function to Rename a Lower Third
async function renameLowerThird(userId, projectId, lowerThirdId, currentName) {

    $('#itemNameUpdate').val(currentName)
    $('#updateItemButton').off('click').on('click', async function () {
        const user = auth.currentUser;
        if (!user) return;

        const newName = $('#itemNameUpdate').val().trim();
        if (!newName) return;

        try {
            const lowerThirdRef = doc(db, "users", userId, "projects", projectId, "lowerThirds", lowerThirdId);
            await updateDoc(lowerThirdRef, { name: newName });
            Toastify({
                text: (`Lower Third renamed to "${newName}" successfully.`),
                position: "center",
                newWindow: true,
                close: true,
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                  },
                duration: 2000,
            }).showToast();
            $('#renameItemModal').modal('hide')
            displayLowerThirds(userId, projectId);
        } catch (error) {
            console.error("❌ Error renaming Lower Third:", error);
            Toastify({
                text: ("Error renaming Lower Third: " + error.message),
                position: "center",
                newWindow: true,
                close: true,
                style: {
                    background: "linear-gradient(to right,rgb(176, rgb(201, 124, 61)#96c93d)",
                  },
                duration: 2000,
            }).showToast();
            $('#renameItemModal').modal('hide')
        }


    })
}

// Function to Delete a Lower Third
async function deleteLowerThird(userId, projectId, lowerThirdId) {
    // if (!confirm("Are you sure you want to delete this Lower Third?")) return;



    $('#itemDeleteButton').off('click').on('click', async function () {
        try {
            const lowerThirdRef = doc(db, "users", userId, "projects", projectId, "lowerThirds", lowerThirdId);
            await deleteDoc(lowerThirdRef);
            console.log(`🗑️ Lower Third deleted: ${lowerThirdId}`);
            Toastify({
                text: ("Lower Third deleted."),
                position: "center",
                newWindow: true,
                oldestFirst: false,
                close: true,
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                  },
                duration: 1000,
            }).showToast();
            $('#itemDeleteModal').modal('hide');
            displayLowerThirds(userId, projectId);
        } catch (error) {
            console.error("❌ Error deleting Lower Third:", error);
            Toastify({
                text: ("Error deleting Lower Third: " + error.message),
                position: "center",
                newWindow: true,
                oldestFirst: false,
                close: true,
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                  },
                duration: 1000,
            }).showToast();
            $('#itemDeleteModal').modal('hide');
        }
    })

    
}

// Function to Duplicate a Lower Third
async function duplicateLowerThird(userId, projectId, lowerThirdId, lowerThirdName) {
    try {
        const lowerThirdRef = doc(db, "users", userId, "projects", projectId, "lowerThirds", lowerThirdId);
        const lowerThirdSnap = await getDoc(lowerThirdRef);

        if (!lowerThirdSnap.exists()) return;

        let copyNumber = 1;
        const lowerThirdsRef = collection(db, "users", userId, "projects", projectId, "lowerThirds");
        const querySnapshot = await getDocs(lowerThirdsRef);

        querySnapshot.forEach((docSnap) => {
            if (docSnap.data().name.startsWith(`${lowerThirdName} (copy`)) {
                const match = docSnap.data().name.match(/\(copy (\d+)\)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num >= copyNumber) copyNumber = num + 1;
                }
            }
        });

        const newLowerThirdName = `${lowerThirdName} (copy ${copyNumber})`;

        await addDoc(lowerThirdsRef, {
            ...lowerThirdSnap.data(),
            name: newLowerThirdName,
            createdAt: new Date()
        });
        Toastify({
            text: (`Lower Third "${newLowerThirdName}" duplicated!`),
            position: "center",
            newWindow: true,
            close: true,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              },
            duration: 3000,
        }).showToast();
        displayLowerThirds(userId, projectId);
    } catch (error) {
        console.error("❌ Error duplicating Lower Third:", error);
        alert("Error duplicating Lower Third: " + error.message);
    }
}

// Function to Display Lower Thirds in the List
async function displayLowerThirds(userId, projectId) {
    const lowerThirdsRef = collection(db, "users", userId, "projects", projectId, "lowerThirds");
    const querySnapshot = await getDocs(lowerThirdsRef);

    const lowerThirdList = document.getElementById("lower-thirds-list");
    lowerThirdList.innerHTML = ""; // Clear previous list

    if(querySnapshot.docs.length != 0){
        querySnapshot.forEach((docSnap) => {
            const lowerThird = docSnap.data();
            const lowerThirdItem = document.createElement("div");
            lowerThirdItem.classList.add("lower-third-item");
            lowerThirdItem.style.cursor = "pointer";
    
            // Clickable text to open the editor
            const lowerThirdLink = document.createElement("span");
            lowerThirdLink.innerHTML = `<i class="fa-light fa-object-group"></i> ${lowerThird.name}`;
            lowerThirdLink.style.flexGrow = "1";
            lowerThirdLink.onclick = () => {
                window.location.href = `editor.html?project=${projectId}&lowerThird=${docSnap.id}`;
            };
    
            // Create button container
            const buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.style.gap = "10px";
    
            // Create Rename Button
            const renameBtn = document.createElement("button");
            renameBtn.innerHTML = `<i class="fa-light fa-pencil"></i> Rename`;
            renameBtn.classList.add('btn','btn-secondary','btn-sm')
            renameBtn.onclick = (event) => {
                event.stopPropagation();
                $('#renameItemModal').modal('show')
                renameLowerThird(userId, projectId, docSnap.id, lowerThird.name);
            };
    
            // Create Duplicate Button
            const duplicateBtn = document.createElement("button");
            duplicateBtn.innerHTML = `<i class="fa-regular fa-clone"></i> Copy`; // Pencil icon + Label
            duplicateBtn.classList.add('btn','btn-secondary','btn-sm')
            duplicateBtn.onclick = (event) => {
                event.stopPropagation();
                duplicateLowerThird(userId, projectId, docSnap.id, lowerThird.name);
            };
    
            // Create Delete Button
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = `<i class="fa-regular fa-trash-can-list"></i> Delete`; // Pencil icon + Label
            deleteBtn.classList.add('btn','btn-danger','btn-sm')
            deleteBtn.onclick = (event) => {
                $('#itemDeleteModal').modal('show')
                event.stopPropagation();
                deleteLowerThird(userId, projectId, docSnap.id);
            };
    
            // Append buttons inside the button container
            buttonContainer.appendChild(renameBtn);
            buttonContainer.appendChild(duplicateBtn);
            buttonContainer.appendChild(deleteBtn); // Add delete button
    
            // Append elements to list item
            lowerThirdItem.appendChild(lowerThirdLink);
            lowerThirdItem.appendChild(buttonContainer);
            lowerThirdList.appendChild(lowerThirdItem);
        });
    }else{
        const span = document.createElement("span"); // Create a span element
        span.classList.add("empty-state"); // Add a class
        span.innerHTML = `<i class="fa-light fa-object-group"></i> <h4>No items found</h4>`;
    
        lowerThirdList.appendChild(span); // Append span to projectList
    }


    

    console.log("📂 Lower Thirds displayed.");
}

onAuthStateChanged(auth, (user) => {
    if (user) loadProject();
});
function goToDashboard() {
    window.location.href = "dashboard.html";
}
window.goToDashboard = function () {
    window.location.href = "dashboard.html";
};


window.createNewLowerThird = createNewLowerThird;