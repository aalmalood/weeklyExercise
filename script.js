// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, get, child, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCVG033ZZhIjMky7Zb2PqsdJb02ay5Fme4",
    authDomain: "excersicetracker.firebaseapp.com",
    databaseURL: "https://excersicetracker-default-rtdb.firebaseio.com",
    projectId: "excersicetracker",
    storageBucket: "excersicetracker.appspot.com",
    messagingSenderId: "973586629666",
    appId: "1:973586629666:web:15f6e3e0b1d43ac040f67b",
    measurementId: "G-L3M00731C1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

const profileSelect = document.getElementById("profile");
const newProfileInput = document.getElementById("new-profile");
const exerciseSection = document.getElementById("exercise-section");

// Function to authenticate anonymously
function authenticate() {
    signInAnonymously(auth)
        .then(() => {
            console.log("Signed in anonymously");
            loadProfiles();
        })
        .catch((error) => {
            console.error("Error signing in anonymously:", error);
        });
}

// Function to load profiles
function loadProfiles() {
    const dbRef = ref(db);
    get(child(dbRef, `profiles/`)).then((snapshot) => {
        if (snapshot.exists()) {
            const profiles = snapshot.val();
            profileSelect.innerHTML = '';
            for (let profile in profiles) {
                const option = document.createElement('option');
                option.value = profile;
                option.textContent = profile;
                profileSelect.appendChild(option);
            }
            loadExerciseData();
        } else {
            console.log("No profiles available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

// Function to add a new profile
function addProfile() {
    const profileName = newProfileInput.value.trim();
    if (profileName === '') {
        alert("Please enter a profile name");
        return;
    }
    set(ref(db, `profiles/${profileName}`), {
        exercises: {
            Monday: '',
            Tuesday: '',
            Wednesday: '',
            Thursday: '',
            Friday: '',
            Saturday: '',
            Sunday: ''
        }
    }).then(() => {
        loadProfiles();
        newProfileInput.value = '';
    }).catch((error) => {
        console.error(error);
    });
}

// Function to load exercise data
function loadExerciseData() {
    const selectedProfile = profileSelect.value;
    if (!selectedProfile) {
        exerciseSection.innerHTML = '';
        return;
    }

    const dbRef = ref(db, `profiles/${selectedProfile}/exercises`);
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const exercises = snapshot.val();
            exerciseSection.innerHTML = '';
            for (let day in exercises) {
                const exerciseDiv = document.createElement('div');
                exerciseDiv.classList.add('form-group');
                exerciseDiv.innerHTML = `
                    <label for="${day}">${day}</label>
                    <input type="text" id="${day}" class="form-control" value="${exercises[day]}" onchange="updateExercise('${day}', this.value)">
                `;
                exerciseSection.appendChild(exerciseDiv);
            }
        } else {
            console.log("No exercise data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

// Function to update exercise data
function updateExercise(day, value) {
    const selectedProfile = profileSelect.value;
    if (!selectedProfile) return;

    update(ref(db, `profiles/${selectedProfile}/exercises`), {
        [day]: value
    }).catch((error) => {
        console.error(error);
    });
}

// Function to reset exercises
function resetExercises() {
    const selectedProfile = profileSelect.value;
    if (!selectedProfile) return;

    const resetData = {
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: '',
        Saturday: '',
        Sunday: ''
    };
    
    set(ref(db, `profiles/${selectedProfile}/exercises`), resetData).then(() => {
        loadExerciseData();
    }).catch((error) => {
        console.error(error);
    });
}

// Attach functions to the window object to make them globally accessible
window.addProfile = addProfile;
window.loadExerciseData = loadExerciseData;
window.resetExercises = resetExercises;

// Initial load of profiles after authentication
document.addEventListener("DOMContentLoaded", () => {
    authenticate();
});
