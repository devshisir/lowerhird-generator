// Import Firebase using CDN (correct way for browser)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3HUhfhoq-ukaCM-eQik4TSErYnmvWHQs",
  authDomain: "simple-thirds.firebaseapp.com",
  projectId: "simple-thirds",
  storageBucket: "simple-thirds.appspot.com",  // Fixed storage bucket URL
  messagingSenderId: "911687963825",
  appId: "1:911687963825:web:a36f181a5a0eddec99be90",
  measurementId: "G-NPSTKMT104"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Firebase Initialized Successfully!");

export { db };
// global variable
const loginButton = document.getElementById("loginButton")
const signUpButton = document.getElementById("signUpButton")


const errorAdd = (message) => {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.innerHTML = "";
        const errorSpan = document.createElement("span");
        errorSpan.innerText = message;
        errorDiv.appendChild(errorSpan);
    }
};

const errorClear = () => {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.innerHTML = "";
    }
};

// Redirect logged-in users to dashboard.html
onAuthStateChanged(auth, (user) => {
    if (user && window.location.pathname === "/index.html") {
        console.log("🔵 User already logged in, redirecting to dashboard...");
        const userName = user.displayName ? user.displayName : user.email;
        Toastify({
            text: (`Welcome, ${userName}!`),
            position: "center",
            newWindow: true,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
              },
            duration: 3000,
        }).showToast();

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);
    }
});

// Import authentication methods from Firebase
import { signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Google Sign-In
const provider = new GoogleAuthProvider();

const googleLogin = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("✅ Google Sign-In Successful:", user);

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 2000);

    } catch (error) {
        console.error("❌ Google Sign-In Error:", error.message);
        alert(error.message);
    }
};

// Email/Password Sign-Up
const emailSignUp = async (email, password) => {
    errorClear()
    signUpButton.classList.add('loading')
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("✅ Account Created Successfully:", user);
        errorClear()
        signUpButton.classList.remove('loading')
    } catch (error) {
        console.error("❌ Sign-Up Error:", error.message);
        errorAdd(error.message)
        signUpButton.classList.remove('loading')
        // alert(error.message);
        
    }
};

// Email/Password Login
const emailLogin = async (email, password) => {
    errorClear()
    loginButton.classList.add('loading')
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("✅ Email Login Successful:", user);
        // alert(`Welcome back, ${user.email}!`);
        errorClear()
        loginButton.classList.remove('loading')
    } catch (error) {
        console.error("❌ Login Error:", error.message);
        // alert(error.message);
        loginButton.classList.remove('loading')
        errorAdd(error.message)
    }
};

// Logout Function
const logout = async () => {
    try {
        await signOut(auth);
        console.log("✅ User Signed Out, redirecting to homepage...");
        
        // Redirect immediately after signing out
        window.location.href = "index.html";
    } catch (error) {
        console.error("❌ Logout Error:", error.message);
        alert(error.message);
    }
};

// Function to Add a New Project
const addProject = async () => {
    const projectName = prompt("Enter Project Name:");
    if (!projectName) return;

    try {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to create a project.");
            return;
        }

        const projectsRef = collection(db, "users", user.uid, "projects");
        const docRef = await addDoc(projectsRef, { name: projectName, createdAt: new Date() });

        console.log(`✅ Project "${projectName}" added with ID: ${docRef.id}`);
        alert(`Project "${projectName}" created!`);
        displayProjects();  // Refresh project list
    } catch (error) {
        console.error("❌ Error adding project:", error);
        alert(error.message);
    }
};

// Function to Display User's Projects
const displayProjects = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const projectsRef = collection(db, "users", user.uid, "projects");
    const querySnapshot = await getDocs(projectsRef);

    const projectList = document.getElementById("projectList");
    projectList.innerHTML = "";  // Clear old list

    querySnapshot.forEach((docSnap) => {
        const project = docSnap.data();
        const projectItem = document.createElement("li");
        projectItem.textContent = project.name;

        // Edit Button
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.onclick = () => editProject(docSnap.id, project.name);
        projectItem.appendChild(editBtn);

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.onclick = () => deleteProject(docSnap.id);
        projectItem.appendChild(deleteBtn);

        projectList.appendChild(projectItem);
    });

    console.log("📂 Projects displayed.");
};

// Function to Edit a Project Name
const editProject = async (projectId, oldName) => {
    const newName = prompt("Enter new project name:", oldName);
    if (!newName || newName === oldName) return;

    try {
        const user = auth.currentUser;
        if (!user) return;

        const projectRef = doc(db, "users", user.uid, "projects", projectId);
        await updateDoc(projectRef, { name: newName });

        console.log(`✏️ Project renamed: ${oldName} → ${newName}`);
        alert(`Project renamed to "${newName}"!`);
        displayProjects();  // Refresh project list
    } catch (error) {
        console.error("❌ Error renaming project:", error);
        alert(error.message);
    }
};

// Function to Delete a Project
const deleteProject = async (projectId) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await deleteDoc(doc(db, "users", user.uid, "projects", projectId));
        console.log(`🗑️ Project deleted: ${projectId}`);
        alert("Project deleted!");
        displayProjects();
    } catch (error) {
        console.error("❌ Error deleting project:", error);
        alert(error.message);
    }
};

// Listen for Auth State Changes and Show Projects if Logged In
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(`🔵 User Logged In: ${user.email}`);
        displayProjects();
    } else {
        console.log("⚫ No user logged in");
        document.getElementById("projectList").innerHTML = "";  // Clear list when logged out
    }
});

// Expose Functions for Buttons in index.html
window.googleLogin = googleLogin;
window.emailSignUp = emailSignUp;
window.emailLogin = emailLogin;
window.logout = logout;
window.addProject = addProject;
window.editProject = editProject;
window.deleteProject = deleteProject;
window.displayProjects = displayProjects;

export { auth };