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

// Get a reference to the database service
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

function addProfile() {
    const profileName = newProfileInput.value.trim();
    if (profileName === '') {
        alert("Please enter a profile name");
        return;
    }

    // Create the profile with exercises
    const profileRef = ref(db, `profiles/${profileName}`);
    set(profileRef, {
        exercises: {}
    }).then(() => {
        // Load existing exercises
        const dbRef = ref(db, `exercises`);
        get(dbRef).then(snapshot => {
            const exercises = {};
            snapshot.forEach(exercise => {
                exercises[exercise.key] = 0; // Initialize with 0 reps
            });
            // Set the exercises for the new profile
            return set(ref(db, `profiles/${profileName}/exercises`), exercises);
        }).then(() => {
            // Reload profiles and exercise data
            loadProfiles();
            loadExerciseData();
            newProfileInput.value = '';
        }).catch(error => {
            console.error("Error adding profile:", error);
        });
    });
}

function loadExerciseData() {
    const selectedProfile = profileSelect.value;
    if (!selectedProfile) return;

    const dbRef = ref(db, `profiles/${selectedProfile}/exercises`);
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const exercises = snapshot.val();
            exerciseSection.innerHTML = '';
            for (let exercise in exercises) {
                const exerciseDiv = document.createElement('div');
                exerciseDiv.classList.add('form-group');
                const imageName = exercise.replace(/\s/g, '');
                var color = "red";
                var ripsLabel = "Remaining:";
                if(exercises[exercise].remaining <= 0){
                    color = "green";
                    exercises[exercise].remaining = exercises[exercise].remaining *-1;
                    ripsLabel = "Extra:" ;
                }
                exerciseDiv.innerHTML = `
                    <div class="row">
                        <div class="column">
                            <img src="src/img/${imageName}.jpg" alt="" width=50% height=50%>
                        </div>
                        <div class="column">  
                                <label style="text-transform: capitalize;" for="${exercise}">${exercise}</label>  
                                <br/>
                                <label id="${exercise}Remaining" style=" font-size: 90%;"> ${ripsLabel} <span style="color:${color};">${exercises[exercise].remaining}</span>/${exercises[exercise].total}</label>
                            </div>
                        </div>
                        <div class="row">
                            <input type="number" id="${exercise}" class="form-control" value="0">
                            <button onclick="logExercise('${selectedProfile}', '${exercise}')" class="btn btn-dark btn-block">Log</button>
                        </div>
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

window.logExercise = function(profile, exercise) {
    const selectedProfileRef = ref(db, `profiles/${profile}/exercises/${exercise}`);
    get(selectedProfileRef).then((snapshot) => {
        if (snapshot.exists()) {
            const currentData = snapshot.val();
            const currentCount = currentData.remaining;
            /*console.log("snapshot.val()", currentData);
            console.log("currentCount", currentCount);*/

            const myElement = document.getElementById(exercise);
            const rips = parseInt(myElement.value);
            const updatedCount = currentCount - rips; // Reduce by the value entered

            const updateData = {};
            updateData[`profiles/${profile}/exercises/${exercise}/remaining`] = updatedCount;

            update(ref(db), updateData).then(() => {
                console.log(`Exercise ${exercise} logged for profile ${profile}`);
                // Reload exercise data after updating
                loadExerciseData();
            }).catch((error) => {
                console.error("Error updating exercise count:", error);
            });

            const ddate = new Date().getTime();
            const logRef = ref(db, `profiles/${profile}/logs/${ddate}`);
            set(logRef, {
                date: ddate,
                exercise: exercise,
                total: currentData.total,
                currentCount: currentCount,
                reduced: rips,
                newCount: updatedCount
            }).then(() => {
                // Reload profiles and exercise data
                loadExerciseData();
            }).catch(error => {
                console.error("Error adding profile log:", error);
            });

        } else {
            console.log("Exercise data not found");
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


// Attach functions to the window object to make them globally accessible
window.addProfile = addProfile;
window.loadExerciseData = loadExerciseData;

// Initial load of profiles after authentication
document.addEventListener("DOMContentLoaded", () => {
    authenticate();
});
