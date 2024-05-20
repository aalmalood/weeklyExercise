// Initialize Firebase
const firebaseConfig = {
 apiKey: "AIzaSyA7y-oD3BqbRhSOqqBpfBPGWD2MuDk1kx4",

  authDomain: "weeklyexercise-31473.firebaseapp.com",

  projectId: "weeklyexercise-31473",

  storageBucket: "weeklyexercise-31473.appspot.com",

  messagingSenderId: "245366626933",

  appId: "1:245366626933:web:56225d7d6b523121b0f63c",

  measurementId: "G-JD4ZNG6NHY"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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
    const exerciseRef = database.ref(`profiles/${profile}/exercises/${exercise}`);

    exerciseRef.once("value", snapshot => {
        const remaining = snapshot.exists() ? parseFloat(snapshot.val()) : getExerciseTotal(exercise);

        if (count > remaining) {
            alert(`You cannot log more than ${remaining} ${exercise}`);
            return;
        }

        const updatedCount = remaining - count;
        exerciseRef.set(updatedCount);
        updateUI(profile);

        if (updatedCount === 0) {
            alert(`Congratulations! You have completed all your ${exercise} for the week!`);
        }

        document.getElementById(exercise).value = '';
    });
}

function getRemaining(exercise, profile) {
    return database.ref(`profiles/${profile}/exercises/${exercise}`).once("value")
        .then(snapshot => {
            return snapshot.exists() ? parseFloat(snapshot.val()) : getExerciseTotal(exercise);
        });
}

function getExerciseTotal(exercise) {
    return database.ref(`exercises/${exercise}`).once("value")
        .then(snapshot => {
            return snapshot.exists() ? parseFloat(snapshot.val()) : 0;
        });
}

function loadProfiles() {
    const profileSelect = document.getElementById("profile");
    profileSelect.innerHTML = "";

    database.ref("profiles").once("value", snapshot => {
        snapshot.forEach(profile => {
            const option = document.createElement("option");
            option.value = profile.key;
            option.textContent = profile.key;
            profileSelect.appendChild(option);
        });

        if (snapshot.numChildren() > 0) {
            profileSelect.value = snapshot.val()[0];
        } else {
            profileSelect.innerHTML = "<option>No profiles</option>";
        }
    });
}

function addProfile() {
    const newProfile = document.getElementById("new-profile").value.trim();
    if (!newProfile) {
        alert("Please enter a profile name");
        return;
    }

    database.ref(`profiles/${newProfile}`).set({}); // Initialize profile in database
    loadProfiles();
    document.getElementById("new-profile").value = '';
}

function loadExerciseData() {
    const profile = document.getElementById("profile").value;
    if (profile === "No profiles") return;

    database.ref("exercises").once("value", snapshot => {
        snapshot.forEach(exercise => {
            database.ref(`profiles/${profile}/exercises/${exercise.key}`).once("value", snapshot => {
                if (!snapshot.exists()) {
                    database.ref(`profiles/${profile}/exercises/${exercise.key}`).set(exercise.val());
                }
            });
        });
        updateUI(profile);
    });
}

function updateUI(profile) {
    database.ref("exercises").once("value", snapshot => {
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

    database.ref(`profiles/${profile}/exercises`).set({});
    updateUI(profile);
}
