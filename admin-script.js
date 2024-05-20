import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// Load exercises on document ready
document.addEventListener("DOMContentLoaded", () => {
    loadExercises();
});

function loadExercises() {
    const exercisesList = document.getElementById("exercises-list");
    exercisesList.innerHTML = "";

    const dbRef = ref(db, "exercises");
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const exercise = childSnapshot.key;
                const reps = childSnapshot.val();

                const div = document.createElement("div");
                div.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

                const name = document.createElement("span");
                name.textContent = exercise;

                const total = document.createElement("input");
                total.type = "number";
                total.value = reps;
                total.classList.add("form-control", "w-25", "mr-2");
                total.onchange = () => updateExerciseTotal(exercise, total.value);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.classList.add("btn", "btn-danger");
                deleteButton.onclick = () => deleteExercise(exercise);

                div.appendChild(name);
                div.appendChild(total);
                div.appendChild(deleteButton);

                exercisesList.appendChild(div);
            });
        } else {
            console.log("No exercises found.");
        }
    }).catch((error) => {
        console.error("Error loading exercises:", error);
    });
}

function addExercise() {
    const name = document.getElementById("new-exercise-name").value.trim();
    const total = parseInt(document.getElementById("new-exercise-total").value);

    if (!name || total <= 0) {
        alert("Please enter a valid exercise name and total reps.");
        return;
    }

    const exerciseRef = ref(db, `exercises/${name}`);
    set(exerciseRef, total)
        .then(() => {
            loadExercises();
            document.getElementById("new-exercise-name").value = '';
            document.getElementById("new-exercise-total").value = '';
        })
        .catch((error) => {
            console.error("Error adding exercise:", error);
        });
}

function updateExerciseTotal(exercise, total) {
    const exerciseRef = ref(db, `exercises/${exercise}`);
    set(exerciseRef, parseInt(total))
        .catch((error) => {
            console.error(`Error updating exercise ${exercise}:`, error);
        });
}

function deleteExercise(exercise) {
    const exerciseRef = ref(db, `exercises/${exercise}`);
    remove(exerciseRef)
        .then(() => {
            loadExercises();
        })
        .catch((error) => {
            console.error(`Error deleting exercise ${exercise}:`, error);
        });
}

// Attach functions to window object
window.addExercise = addExercise;
window.updateExerciseTotal = updateExerciseTotal;
window.deleteExercise = deleteExercise;
