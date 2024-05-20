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
    loadExercises();
});

function loadExercises() {
    const exercisesList = document.getElementById("exercises-list");
    exercisesList.innerHTML = "";

    database.ref("exercises").once("value", snapshot => {
        snapshot.forEach(exercise => {
            const div = document.createElement("div");
            div.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

            const name = document.createElement("span");
            name.textContent = exercise.key;

            const total = document.createElement("input");
            total.type = "number";
            total.value = exercise.val();
            total.classList.add("form-control", "w-25", "mr-2");
            total.onchange = () => updateExerciseTotal(exercise.key, total.value);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("btn", "btn-danger");
            deleteButton.onclick = () => deleteExercise(exercise.key);

            div.appendChild(name);
            div.appendChild(total);
            div.appendChild(deleteButton);

            exercisesList.appendChild(div);
        });
    });
}

function addExercise() {
    const name = document.getElementById("new-exercise-name").value.trim();
    const total = parseInt(document.getElementById("new-exercise-total").value);

    if (!name || total <= 0) {
        alert("Please enter a valid exercise name and total reps.");
        return;
    }

    database.ref(`exercises/${name}`).set(total)
        .then(() => {
            loadExercises();
            document.getElementById("new-exercise-name").value = '';
            document.getElementById("new-exercise-total").value = '';
        })
        .catch(error => {
            console.error("Error adding exercise: ", error);
        });
}

function updateExerciseTotal(exercise, total) {
    database.ref(`exercises/${exercise}`).set(parseInt(total))
        .catch(error => {
            console.error(`Error updating exercise ${exercise}: `, error);
        });
}

function deleteExercise(exercise) {
    database.ref(`exercises/${exercise}`).remove()
        .then(() => {
            loadExercises();
        })
        .catch(error => {
            console.error(`Error deleting exercise ${exercise}: `, error);
        });
}
