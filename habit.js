const habitForm = document.getElementById('habit-form');
const habitInput = document.getElementById('habit-input');
const habitListUL = document.getElementById('habit-list');

let allHabits = getHabits();
updateHabitList();

habitForm.addEventListener('submit', function(e){
    e.preventDefault();
    addHabit();
})

function addHabit(){
    const habitText = habitInput.value.trim();
    if(habitText.length > 0){
        const habitObject = {
            text:habitText,
            completed: false
        }
        allHabits.push(habitObject);
        updateHabitList();
        saveHabits();
        habitInput.value = "";
    }
}

function updateHabitList(){
    habitListUL.innerHTML = "";
    allHabits.forEach((habit, habitIndex)=>{
        habitItem = createhabitItem(habit, habitIndex);
        habitListUL.append(habitItem);
    })
}
function createhabitItem(habit, habitIndex){
    const habitId = "habit-" + habitIndex;
    const habitLI = document.createElement("li");
    const habitText = habit.text;
    habitLI.className = "habit";
    habitLI.innerHTML = `
    <input type="checkbox" id="${habitId}">
                <label class="custom-checkbox" for="${habitId}">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="transparent"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
                </label>
                <label for="${habitId}" class="habit-text">
                    ${habitText}
                </label>
                <button class="delete-button">
                    <svg fill="var(--secondary-color)" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                </button>
    `;
    const deleteButton = habitLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", ()=>{
        deletehabitItem(habitIndex);
    })
    const checkbox = habitLI.querySelector("input");
    checkbox.addEventListener("change", ()=>{
        allHabits[habitIndex].completed = checkbox.checked;
        saveHabits();
    });
    checkbox.checked = habit.completed;
    return habitLI;
}

function deletehabitItem(habitIndex){
    allHabits = allHabits.filter((_, i) => i !== habitIndex);
    saveHabits();
    updateHabitList();
}

function saveHabits(){
    const habitsJson = JSON.stringify(allHabits);
    localStorage.setItem("habits", habitsJson);
}

function getHabits(){
    const habits = localStorage.getItem("habits") || "[]";
    return JSON.parse(habits);
}