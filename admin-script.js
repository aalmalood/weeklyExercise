document.addEventListener("DOMContentLoaded", () => {
    loadExercises();
});

function loadExercises() {
    const exercisesList = document.getElementById("exercises-list");
    exercisesList.innerHTML = "";

    const exercises = JSON.parse(localStorage.getItem("exercises")) || {};
    Object.keys(exercises).forEach(exercise => {
        const div = document.createElement("div");
        div.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

        const name = document.createElement("span");
        name.textContent = exercise;

        const total = document.createElement("input");
        total.type = "number";
        total.value = exercises[exercise];
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
}

function addExercise() {
    const name = document.getElementById("new-exercise-name").value.trim();
    const total = parseInt(document.getElementById("new-exercise-total").value);

    if (!name || total <= 0) {
        alert("Please enter a valid exercise name and total reps.");
        return;
    }

    const exercises = JSON.parse(localStorage.getItem("exercises")) || {};
    if (exercises[name]) {
        alert("Exercise already exists.");
        return;
    }

    exercises[name] = total;
    localStorage.setItem("exercises", JSON.stringify(exercises));
    loadExercises();
    document.getElementById("new-exercise-name").value = '';
    document.getElementById("new-exercise-total").value = '';
}

function updateExerciseTotal(exercise, total) {
    const exercises = JSON.parse(localStorage.getItem("exercises")) || {};
    exercises[exercise] = parseInt(total);
    localStorage.setItem("exercises", JSON.stringify(exercises));
}

function deleteExercise(exercise) {
    const exercises = JSON.parse(localStorage.getItem("exercises")) || {};
    delete exercises[exercise];
    localStorage.setItem("exercises", JSON.stringify(exercises));
    loadExercises();
}
