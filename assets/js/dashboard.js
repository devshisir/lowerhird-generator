import { db, auth } from "./app.js";
import { collection, updateDoc, addDoc, getDocs, deleteDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";





// Function to Create a New Project
async function createNewProject() {
    const projectName = document.getElementById('projectName').value;
    const SaveButton = document.getElementById('saveButton');

    if (!projectName) return;

    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in to create a project.");
        return;
    }
    try {
        const projectsRef = collection(db, "users", user.uid, "projects");
        await addDoc(projectsRef, {
            name: projectName,
            createdAt: new Date()
        });
        $('#createProjectModal').modal('hide');
        Toastify({
            text: (`Project "${projectName}" has been added.`),
            position: "center",
            newWindow: true,
            close: true,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              },
            duration: 3000,
        }).showToast();
        displayProjects();
    } catch (error) {
        console.error("❌ Error creating project:", error);
        alert("Error creating project: " + error.message);
    }
}

// Function to Delete a Project
async function deleteProject(projectId) {
    

    // if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
    //     return;
    // }

    $('#projectDeleteButton').off('click').on('click', async function () {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const projectRef = doc(db, "users", user.uid, "projects", projectId);
            await deleteDoc(projectRef);
            console.log(`🗑️ Project deleted: ${projectId}`);
            // alert("Project deleted.");
            $('#projectDeleteModal').modal('hide')
            Toastify({
                text: (`Project deleted.`),
                position: "center",
                newWindow: true,
                oldestFirst: false,
                close: true,
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                  },
                duration: 1000,
            }).showToast();
            displayProjects();
        } catch (error) {
            console.error("❌ Error deleting project:", error);
            alert("Error deleting project: " + error.message);
            Toastify({
                text: ("Error deleting project: " + error.message),
                position: "center",
                newWindow: true,
                style: {
                    background: "linear-gradient(to right,rgb(176, 56, 0),rgb(201, 117, 61))",
                  },
                duration: 1000,
            }).showToast();

            $('#projectDeleteModal').modal('hide')
        }
    })

    
}

// Function to Duplicate a Project
async function duplicateProject(projectId, projectName) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Get all projects to find the highest copy number
        const projectsRef = collection(db, "users", user.uid, "projects");
        const querySnapshot = await getDocs(projectsRef);
        
        let copyNumber = 1;
        querySnapshot.forEach((docSnap) => {
            const existingName = docSnap.data().name;
            if (existingName.startsWith(`${projectName} (copy`)) {
                const match = existingName.match(/\(copy (\d+)\)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num >= copyNumber) copyNumber = num + 1;
                }
            }
        });

        const newProjectName = `${projectName} (copy ${copyNumber})`;

        // Create a new project with copied name
        const newProjectRef = await addDoc(projectsRef, {
            name: newProjectName,
            createdAt: new Date()
        });

        console.log(`📑 Project duplicated as "${newProjectName}"`);

        // Copy lower thirds from the original project
        const originalLowerThirdsRef = collection(db, "users", user.uid, "projects", projectId, "lowerThirds");
        const lowerThirdsSnapshot = await getDocs(originalLowerThirdsRef);

        lowerThirdsSnapshot.forEach(async (docSnap) => {
            await addDoc(collection(db, "users", user.uid, "projects", newProjectRef.id, "lowerThirds"), docSnap.data());
        });

        // alert(`Project duplicated as "${newProjectName}".`);
        Toastify({
            text: (`Project duplicated as "${newProjectName}".`),
            position: "center",
            newWindow: true,
            close: true,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              },
            duration: 3000,
        }).showToast();
        displayProjects();  // Refresh list
    } catch (error) {
        console.error("❌ Error duplicating project:", error);
        // alert("Error duplicating project: " + error.message);
        Toastify({
            text: ("Error duplicating project: " + error.message),
            position: "center",
            newWindow: true,
            close: true,
            style: {
                background: "linear-gradient(to right,rgb(176, 41, 0),rgb(201, 129, 61))",
              },
            duration: 3000,
        }).showToast();
    }
}

// Function to Display User's Projects
async function displayProjects() {
    const user = auth.currentUser;
    if (!user) return;

    const projectsRef = collection(db, "users", user.uid, "projects");
    const querySnapshot = await getDocs(projectsRef);
console.log(querySnapshot)
    const projectList = document.getElementById("project-list");
    projectList.innerHTML = ""; // Clear previous list
    if(querySnapshot.docs.length != 0){
        querySnapshot.forEach((docSnap) => {
            const project = docSnap.data();
            const projectItem = document.createElement("li");
            projectItem.classList.add("project-item");
    
            // Create clickable project link
            const projectLink = document.createElement("span");
            projectLink.innerHTML = `<i class="fa-regular fa-folder"></i> ${project.name}`;
            projectLink.style.cursor = "pointer";
            projectLink.onclick = () => openProject(docSnap.id);
    
            // Create a container for buttons
            const buttonContainer = document.createElement("div");
            buttonContainer.style.display = "flex";
            buttonContainer.classList.add('actionButtons');
            buttonContainer.style.gap = "10px"; // Space between buttons
    
            // Create Rename button
            const renameBtn = document.createElement("button");
            renameBtn.innerHTML = `<i class="fa-light fa-pencil"></i> Rename`; // Pencil icon + Label
            renameBtn.classList.add('btn','btn-secondary','btn-sm')
            renameBtn.onclick = (event) => {
                event.stopPropagation();
                renameProject(docSnap.id, project.name);
                $('#renameProjectModal').modal('show');
            };
    
            // Create Duplicate button
            const duplicateBtn = document.createElement("button");
            duplicateBtn.innerHTML = `<i class="fa-regular fa-clone"></i> Copy`; // Pencil icon + Label
            duplicateBtn.classList.add('btn','btn-secondary','btn-sm')
            duplicateBtn.onclick = (event) => {
                event.stopPropagation();
                duplicateProject(docSnap.id, project.name);
            };
    
            // Create Delete button
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = `<i class="fa-regular fa-trash-can-list"></i> Delete`; // Pencil icon + Label
            deleteBtn.classList.add('btn','btn-danger','btn-sm')
            deleteBtn.onclick = (event) => {
                $('#projectDeleteModal').modal('show')
                event.stopPropagation();
                deleteProject(docSnap.id);
            };
    
            // Append buttons inside the button container
            buttonContainer.appendChild(renameBtn);
            buttonContainer.appendChild(duplicateBtn);
            buttonContainer.appendChild(deleteBtn);
    
            // Append elements
            projectItem.appendChild(projectLink);
            projectItem.appendChild(buttonContainer);
            projectList.appendChild(projectItem);
        });
    }else{
        const span = document.createElement("span"); // Create a span element
        span.classList.add("empty-state"); // Add a class
        span.innerHTML = `<i class="fa-regular fa-folder"></i> <h4>No project found</h4>`;
    
        projectList.appendChild(span); // Append span to projectList
    }

    

    console.log("📂 Projects displayed.");
}

// Rename Project Function
async function renameProject(projectId, oldName) {
    $('#projectNameUpdate').val(oldName)
    $('#updateButton').on('click',async function(){
        const user = auth.currentUser;
        if (!user) return;
        // Ask user for new project name
        const newName = $('#projectNameUpdate').val().trim();
        if (!newName) return;
        try {
            const projectRef = doc(db, "users", user.uid, "projects", projectId);
            await updateDoc(projectRef, { name: newName });
            // alert(`Project renamed to "${newName}" successfully.`);
            $('#renameProjectModal').modal('hide');
            Toastify({
                text: (`Project renamed to "${newName}" successfully.`),
                position: "center",
                newWindow: true,
                close: true,
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                  },
                duration: 3000,
            }).showToast();
            displayProjects();
        } catch (error) {
            console.error("Error renaming project:", error);
            alert("Failed to rename project. Please try again.");
        }
    })
}



// Redirect to Project Management Page Instead of Editor
function openProject(projectId) {
    window.location.href = `project.html?project=${projectId}`;
}

// Logout Function
async function logout() {
    try {
        await signOut(auth);
        console.log("✅ User Signed Out. Redirecting to homepage...");
        window.location.href = "index.html";
    } catch (error) {
        console.error("❌ Logout Error:", error);
        alert(error.message);
    }
}

// Listen for Auth State Changes and Show Projects
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(`🔵 User Logged In: ${user.email}`);
        // document.getElementById("user-info").textContent = `Welcome, ${user.email}`;
        displayProjects();
    } else {
        console.log("⚫ No user logged in");
        window.location.href = "index.html";  // Redirect to homepage if not logged in
    }
});

// Ensure Functions are Exposed for HTML
window.createNewProject = createNewProject;
window.logout = logout;

export { createNewProject, displayProjects };
