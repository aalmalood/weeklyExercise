// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
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
const db = getDatabase(app);

const profileSelect = document.getElementById("profile");
const newProfileInput = document.getElementById("new-profile");
const exerciseSection = document.getElementById("exercise-section");

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

function updateExercise(day, value) {
    const selectedProfile = profileSelect.value;
    if (!selectedProfile) return;

    update(ref(db, `profiles/${selectedProfile}/exercises`), {
        [day]: value
    }).catch((error) => {
        console.error(error);
    });
}

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

document.addEventListener("DOMContentLoaded", () => {
    loadProfiles();
    loadExerciseData();
});

function logExercise(exercise) {
    const input = document.getElementById(exercise).value;
    if (!input || input <= 0) {
        alert("Please enter a valid number");
        return;
    }

    const count = parseFloat(input);
    const profile = document.getElementById("profile").value;
    const exerciseRef = ref(db, `profiles/${profile}/exercises/${exercise}`);

    get(exerciseRef).then(snapshot => {
        const remaining = snapshot.exists() ? parseFloat(snapshot.val()) : getExerciseTotal(exercise);

        if (count > remaining) {
            alert(`You cannot log more than ${remaining} ${exercise}`);
            return;
        }

        const updatedCount = remaining - count;
        set(exerciseRef, updatedCount).then(() => {
            updateUI(profile);

            if (updatedCount === 0) {
                alert(`Congratulations! You have completed all your ${exercise} for the week!`);
            }

            document.getElementById(exercise).value = '';
        });
    });
}

function getRemaining(exercise, profile) {
    return get(ref(db, `profiles/${profile}/exercises/${exercise}`)).then(snapshot => {
        return snapshot.exists() ? parseFloat(snapshot.val()) : getExerciseTotal(exercise);
    });
}

function getExerciseTotal(exercise) {
    return get(ref(db, `exercises/${exercise}`)).then(snapshot => {
        return snapshot.exists() ? parseFloat(snapshot.val()) : 0;
    });
}

function updateUI(profile) {
    get(ref(db, "exercises")).then(snapshot => {
        const exerciseSection = document.getElementById("exercise-section");
        exerciseSection.innerHTML = "";

        snapshot.forEach(exercise => {
            const div = document.createElement("div");
            div.classList.add("form-group");

            const label = document.createElement("label");
            label.htmlFor = exercise.key;
            label.textContent = `${exercise.key.charAt(0).toUpperCase() + exercise.key.slice(1)}:`;

            const input = document.createElement("input");
            input.type = "number";
            input.id = exercise.key;
            input.classList.add("form-control");
            input.placeholder = "0";

            const button = document.createElement("button");
            button.onclick = () => logExercise(exercise.key);
            button.classList.add("btn", "btn-primary", "mt-2");
            button.textContent = "Log";

            const span = document.createElement("span");
            span.id = `${exercise.key}-left`;
            getRemaining(exercise.key, profile).then(remaining => {
                span.textContent = `${remaining} left`;
                span.classList.add("ml-2");
                div.appendChild(label);
                div.appendChild(input);
                div.appendChild(button);
                div.appendChild(span);
                exerciseSection.appendChild(div);
            });
        });
    });
}

function resetExercises() {
    const profile = document.getElementById("profile").value;
    if (profile === "No profiles") return;

    set(ref(db, `profiles/${profile}/exercises`), {}).then(() => {
        updateUI(profile);
    });
}
