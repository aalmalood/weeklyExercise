// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, set, get, update, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

let activeProfile = null; // Global variable to store the active profile

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
    const dbRef = ref(db, 'familyProfiles/');
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const profiles = snapshot.val();
            const profilesList = document.getElementById("profiles-list");
            profilesList.innerHTML = '';
            for (let profile in profiles) {
                const div = document.createElement('div');
                div.classList.add('list-group-item');
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span onclick="setActiveProfile('${profile}')">${profile}</span>
                        <button onclick="deleteProfile('${profile}')" class="btn btn-danger btn-sm">Delete</button>
                    </div>
                    <div class="ml-4 mt-2">
                        <button onclick="loadExercises('${profile}')" class="btn btn-secondary btn-sm">Manage Exercises</button>
                    </div>
                `;
                profilesList.appendChild(div);
            }
        } else {
            console.log("No profiles available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

// Function to set the active profile
function setActiveProfile(profile) {
    activeProfile = profile;
    //setActiveProfile(profile);
    console.log("profile" , profile);
    document.querySelectorAll('#profiles-list .list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`#profiles-list .list-group-item span[onclick="setActiveProfile('${profile}')"]`).parentNode.parentNode.classList.add('active');
    //loadExercises(profile);
}

// Function to add a new profile
function addProfile() {
    const profileName = document.getElementById("new-profile-name").value.trim();
    if (profileName === '') {
        alert("Please enter a profile name");
        return;
    }
    console.log("profileNamee" , profileName);
   /* const profileRef = ref(db, `profiles/${profileName}`);
    set(profileRef, {
        exercises: {}
    }).then(() => {
        loadProfiles();
        document.getElementById("new-profile-name").value = '';
    }).catch((error) => {
        console.error("Error adding profile:", error);
    });*/
     // Create the profile with exercises
     const profileRef = ref(db, `familyProfiles/${profileName}`);
     set(profileRef, {
        
         exercises: {}
     }).then(() => {
         // Load existing exercises
        
         console.log("profileNamee in then" , profileName);
         const dbRef = ref(db, `familyExercises`);
         get(dbRef).then(snapshot => {
             const exercises = {};

             snapshot.forEach(exercise => {
                const newExerciseRips = {
                    remaining: exercise.val(),
                    total: exercise.val()
                };
                 exercises[exercise.key] = newExerciseRips; 
             });
             // Set the exercises for the new profile
             //loadProfiles();
             set(ref(db, `familyProfiles/${profileName}/exercises`), exercises);
             
             
             
         }).then(() => {
            console.log("profileNamee in then then " , profileName);
             // Reload profiles and exercise data
             loadProfiles();
             //loadExerciseData();
             document.getElementById("new-profile-name").value = '';
         }).catch(error => {
             console.error("Error adding profile:", error);
         });
     });
}

// Function to delete a profile
function deleteProfile(profile) {
    const profileRef = ref(db, `familyProfiles/${profile}`);
    remove(profileRef).then(() => {
        loadProfiles();
    }).catch((error) => {
        console.error("Error deleting profile:", error);
    });
}

// Function to load exercises for a selected profile
function loadExercises(profile) {
    const dbRef = ref(db, `familyProfiles/${profile}/exercises`);
    setActiveProfile(profile);
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const exercises = snapshot.val();
            const exercisesList = document.getElementById("exercises-list");
            exercisesList.innerHTML = '<div width=90% class="d-flex justify-content-between align-items-left"><span>Exercise Name</span><span>Remaining</span><span>total</span><span>Action</span></div>';
            for (let exercise in exercises) {
                const div = document.createElement('div');
                div.classList.add('list-group-item');
                div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${exercise}</span>
                        <input type="number" value="${exercises[exercise].remaining}" class="form-control w-25 mr-2" onchange="updateExercise('${profile}', '${exercise}', this.value)">
                        <input type="number" value="${exercises[exercise].total}" class="form-control w-25 mr-2" onchange="updateExerciseTotal('${profile}', '${exercise}', this.value)">
                        <button onclick="deleteExercise('${profile}', '${exercise}')" class="btn btn-danger btn-sm">Delete</button>
                    </div>
                `;
                exercisesList.appendChild(div);
            }
            exercisesList.innerHTML = exercisesList.innerHTML +  `
            <div class="d-flex justify-content-between align-items-center">
                <button onclick="resetExercises('${profile}')" class="btn btn-danger btn-sm">Reset</button>
            </div>
        `;
            loadLogs(activeProfile);
        } else {
            console.log("No exercises available for this profile");
        }
        
    }).catch((error) => {
        console.error(error);
    });
}

// Function to add a new exercise to a profile
function addExercise() {
    if (!activeProfile) {
        alert("Please select a profile to add exercise to");
        return;
    }
    const exerciseName = document.getElementById("new-exercise-name").value.trim();
    const totalReps = parseInt(document.getElementById("new-exercise-total").value);

    if (!exerciseName || totalReps <= 0) {
        alert("Please enter a valid exercise name and total reps");
        return;
    }

    const newExerciseRips = {
        remaining: totalReps,
        total: totalReps
    };

    const exerciseRef = ref(db, `familyProfiles/${activeProfile}/exercises/${exerciseName}`);
    set(exerciseRef, newExerciseRips).then(() => {
        loadExercises(activeProfile);
        loadLogs(activeProfile);
        document.getElementById("new-exercise-name").value = '';
        document.getElementById("new-exercise-total").value = '';
    }).catch((error) => {
        console.error("Error adding exercise:", error);
    });
}

// Function to update an exercise's total reps
function updateExercise(profile, exercise, total) {
    const exerciseRef = ref(db, `familyProfiles/${profile}/exercises/${exercise}/remaining`);
    set(exerciseRef, parseInt(total)).catch((error) => {
        console.error("Error updating exercise:", error);
    });
}

// Function to update an exercise's total reps
function updateExerciseTotal(profile, exercise, total) {
    const exerciseRef = ref(db, `familyProfiles/${profile}/exercises/${exercise}/total`);
    set(exerciseRef, parseInt(total)).catch((error) => {
        console.error("Error updating exercise:", error);
    });
}


// Function to delete an exercise from a profile
function deleteExercise(profile, exercise) {
    const exerciseRef = ref(db, `familyProfiles/${profile}/exercises/${exercise}`);
    remove(exerciseRef).then(() => {
        loadExercises(profile);
        loadLogs(profile);
    }).catch((error) => {
        console.error("Error deleting exercise:", error);
    });
}

function resetExercises(profile) {
    const dbRef = ref(db, `familyProfiles/${profile}/exercises/`);
    get(dbRef).then(snapshot => {
        const exercises = {};
        
        snapshot.forEach(exerciseSnapshot => {
            const exercise = exerciseSnapshot.val();
            const exerciseKey = exerciseSnapshot.key;
            
            console.log("exercise", exercise);
            
            if (exercise.total === undefined) {
                console.error(`Exercise ${exerciseKey} has undefined total value`);
            } else {
                const newExerciseReps = {
                    remaining: exercise.total,
                    total: exercise.total
                };
                exercises[exerciseKey] = newExerciseReps;
            }
        });
        
        console.log("exercises", exercises);
        // Set the exercises for the new profile
         set(ref(db, `familyProfiles/${profile}/exercises`), exercises);
         loadExercises(profile);
    }).then(() => {
        // Reload profiles and exercise data
        loadExercises(profile);
        document.getElementById("new-profile-name").value = '';
    }).catch(error => {
        console.error("Error adding profile:", error);
    });
}

// Function to load exercises for a selected profile
function loadLogs(profile) {
    const dbRef = ref(db, `familyProfiles/${profile}/logs`);
    setActiveProfile(profile);
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const logs = snapshot.val();
            const logsList = document.getElementById("log-list");
            logsList.innerHTML = '';
            const div = document.createElement('table');
            div.classList.add('table');    
            div.classList.add('table-striped');
                div.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Exercise</th>
                            <th scope="col">Old Count</th>
                            <th scope="col">Entry Value</th>
                            <th scope="col">New Count</th>
                        
                        </tr>
                    </thead>
                `;
                
            for (let logKey in logs) {
                const log = logs[logKey]; // Access each log object
               console.log("log", log);
               console.log("log..date", log.date);
                // Check if properties exist, if not, assign an empty string
                let date = log.date ? log.date : '';
                date = new Date(log.date).toLocaleString();
                const exercise = log.exercise ? log.exercise : '';
                const currentCount = log.currentCount ? log.currentCount : '';
                const reduced = log.reduced ? log.reduced : '';
                const newCount = log.newCount ? log.newCount : '';

               
                div.innerHTML = div.innerHTML + `
                    
                        <tr>
                            <th scope="row">${date}</th>
                            <th scope="row">${exercise}</th>
                            <th scope="row">${currentCount}</th>
                            <th scope="row">${reduced}</th>
                            <th scope="row">${newCount}</th>
                        
                        </tr>
                `;
            }
            
               
                div.innerHTML = div.innerHTML + `
                    </table>
                `;
                logsList.appendChild(div);
        } else {
            const logsList = document.getElementById("log-list");
            logsList.innerHTML = '';
            console.log("No logs available for this profile");
        }
    }).catch((error) => {
        console.error(error);
    });
}


// Attach functions to the window object to make them globally accessible
window.addProfile = addProfile;
window.deleteProfile = deleteProfile;
window.setActiveProfile = setActiveProfile;
window.loadExercises = loadExercises;
window.loadLogs = loadLogs;
window.addExercise = addExercise;
window.updateExercise = updateExercise;
window.deleteExercise = deleteExercise;
window.resetExercises = resetExercises;

// Initial load of profiles after authentication
document.addEventListener("DOMContentLoaded", () => {
    authenticate();
});


