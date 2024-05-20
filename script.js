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
    const remaining = getRemaining(exercise, profile);

    if (count > remaining) {
        alert(`You cannot log more than ${remaining} ${exercise}`);
        return;
    }

    const updatedCount = remaining - count;
    localStorage.setItem(`${profile}_${exercise}`, updatedCount);
    updateUI(profile);

    if (updatedCount === 0) {
        alert(`Congratulations! You have completed all your ${exercise} for the week!`);
    }

    document.getElementById(exercise).value = '';
}

function getRemaining(exercise, profile) {
    return parseFloat(localStorage.getItem(`${profile}_${exercise}`)) || getExerciseTotal(exercise);
}

function getExerciseTotal(exercise) {
    const exercises = JSON.parse(localStorage.getItem("exercises")) || {};
    return exercises[exercise] || 0;
}

function loadProfiles() {
    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
    const profileSelect = document.getElementById("profile");
    profileSelect.innerHTML = "";

    profiles.forEach(profile => {
        const option = document.createElement("option");
        option.value = profile;
        option.textContent = profile;
        profileSelect.appendChild(option);
    });

    if (profiles.length > 0) {
        profileSelect.value = profiles[0];
    } else {
        profileSelect.innerHTML = "<option>No profiles</option>";
    }
}

function addProfile() {
    const newProfile = document.getElementById("new-profile").value.trim();
    if (!newProfile) {
        alert("Please enter a profile name");
        return;
    }

    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
    if (profiles.includes(newProfile)) {
        alert("Profile already exists");
        return;
    }

    profiles.push(newProfile);
    localStorage.setItem("profiles", JSON.stringify(profiles));
    loadProfiles();
    document.getElementById("new-profile").value = '';
}

function loadExerciseData() {
    const profile = document.getElementById("profile").value;
    if (profile === "No profiles") return;
    const exercises = JSON.parse(localStorage.getItem("exercises")) || {};
    Object.keys(exercises).forEach(exercise => {
        if (localStorage.getItem(`${profile}_${exercise}`) === null) {
            localStorage.setItem(`${profile}_${exercise}`, exercises[exercise]);
        }
    });
    updateUI(profile);
}

function updateUI(profile) {
    const exercises = JSON.parse(localStorage.getItem("exercises")) || {};
    const exerciseSection = document.getElementById("exercise-section");
    exerciseSection.innerHTML = "";

    Object.keys(exercises).forEach(exercise => {
        const div = document.createElement("div");
        div.classList.add("form-group");

        const label = document.createElement("label");
        label.htmlFor = exercise;
        label.textContent = `${exercise.charAt(0).toUpperCase() + exercise.slice(1)}:`;

        const input = document.createElement("input");
        input.type = "number";
        input.id = exercise;
        input.classList.add("form-control");
        input.placeholder = "0";

        const button = document.createElement("button");
        button.onclick = () => logExercise(exercise);
        button.classList.add("btn", "btn-primary", "mt-2");
        button.textContent = "Log";

        const span = document.createElement("span");
        span.id = `${exercise}-left`;
        span.textContent = `${getRemaining(exercise, profile)} left`;
        span.classList.add("ml-2");

        div.appendChild(label);
        div.appendChild(input);
        div.appendChild(button);
        div.appendChild(span);

        exerciseSection.appendChild(div);
    });
}

function resetExercises() {
    const profile = document.getElementById("profile").value;
    if (profile === "No profiles") return;
    
    const exercises = JSON.parse(localStorage.getItem("exercises")) || {};
    Object.keys(exercises).forEach(exercise => {
        localStorage.setItem(`${profile}_${exercise}`, exercises[exercise]);
    });
    
    updateUI(profile);
}
