const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitListUL = document.getElementById('habit-list');

let allHabits = getHabits();
updateHabitList();

habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addHabit();
});

function addHabit() {
    const text = habitInput.value.trim();
    if (!text) return;
    allHabits.push({ text, completed: false });
    saveHabits();
    updateHabitList();
    habitInput.value = "";
}

function updateHabitList() {
    habitListUL.innerHTML = "";
    allHabits.forEach((habit, index) => {
        habitListUL.append(createHabitItem(habit, index));
    });
}

function createHabitItem(habit, index) {
    const id = "habit-" + index;
    const li = document.createElement("li");
    li.className = "habit";
    li.innerHTML = `
        <input type="checkbox" id="${id}">
        <label class="custom-checkbox" for="${id}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="transparent">
                <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
            </svg>
        </label>
        <label for="${id}" class="habit-text">${habit.text}</label>
        <button class="delete-button" title="Dzēst">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
            </svg>
        </button>
    `;

    const checkbox = li.querySelector("input[type='checkbox']");
    checkbox.checked = habit.completed;
    checkbox.addEventListener("change", () => {
        allHabits[index].completed = checkbox.checked;
        saveHabits();
    });

    li.querySelector(".delete-button").addEventListener("click", () => {
        deleteHabitItem(index);
    });

    return li;
}

function deleteHabitItem(index) {
    allHabits = allHabits.filter((_, i) => i !== index);
    saveHabits();
    updateHabitList();
}

function saveHabits() {
    localStorage.setItem("habits", JSON.stringify(allHabits));
}

function getHabits() {
    return JSON.parse(localStorage.getItem("habits") || "[]");
}