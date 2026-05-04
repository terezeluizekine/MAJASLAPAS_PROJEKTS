const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');

const PRIORITY_RANK = { high: 1, medium: 2, low: 3 };

let allTodos = getTodos();
sortTodos();
updateTodoList();

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo();
});

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    allTodos.push({ text, completed: false, deadline: null, priority: null });
    sortTodos();
    saveTodos();
    updateTodoList();
    todoInput.value = "";
}

//Kārtošana: termiņš → prioritāte → alfabēts
function sortTodos() {
    allTodos.sort((a, b) => {
        const aHas = !!a.deadline;
        const bHas = !!b.deadline;
        if (aHas && bHas && a.deadline !== b.deadline) return a.deadline.localeCompare(b.deadline);
        if (aHas !== bHas) return aHas ? -1 : 1;

        const aPri = PRIORITY_RANK[a.priority] || 99;
        const bPri = PRIORITY_RANK[b.priority] || 99;
        if (aPri !== bPri) return aPri - bPri;

        return a.text.localeCompare(b.text, 'lv', { sensitivity: 'base' });
    });
}

function isOverdue(dateStr) {
    if (!dateStr) return false;
    return dateStr < new Date().toISOString().split('T')[0];
}

function updateTodoList() {
    todoListUL.innerHTML = "";
    allTodos.forEach((todo, index) => {
        todoListUL.append(createTodoItem(todo, index));
    });
}

function createTodoItem(todo, index) {
    const id = "todo-" + index;
    const li = document.createElement("li");
    li.className = "todo";
    if (todo.priority) li.classList.add(`priority-${todo.priority}`);
    if (isOverdue(todo.deadline) && !todo.completed) li.classList.add('overdue');

    li.innerHTML = `
        <input type="checkbox" id="${id}">
        <label class="custom-checkbox" for="${id}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="transparent">
                <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
            </svg>
        </label>
        <label for="${id}" class="todo-text">${todo.text}</label>
        <select class="todo-priority-select" title="Prioritāte">
            <option value=""       ${!todo.priority             ? 'selected' : ''}>—</option>
            <option value="high"   ${todo.priority === 'high'   ? 'selected' : ''}>Augsta</option>
            <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Vidēja</option>
            <option value="low"    ${todo.priority === 'low'    ? 'selected' : ''}>Zema</option>
        </select>
        <input type="date" class="todo-deadline-input" value="${todo.deadline || ''}" title="Termiņš">
        <button class="delete-button" title="Dzēst">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
            </svg>
        </button>
    `;

    const checkbox = li.querySelector("input[type='checkbox']");
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
        allTodos[index].completed = checkbox.checked;
        saveTodos();
        updateTodoList();
    });

    const prioritySelect = li.querySelector(".todo-priority-select");
    prioritySelect.addEventListener("change", () => {
        allTodos[index].priority = prioritySelect.value || null;
        sortTodos();
        saveTodos();
        updateTodoList();
    });

    // Termiņš: change saglabā klusi, blur tikai tad pārkārto sarakstu
    const deadlineInput = li.querySelector(".todo-deadline-input");
    deadlineInput.addEventListener("change", () => {
        allTodos[index].deadline = deadlineInput.value || null;
        saveTodos();
    });
    deadlineInput.addEventListener("blur", () => {
        sortTodos();
        updateTodoList();
    });

    li.querySelector(".delete-button").addEventListener("click", () => {
        deleteTodoItem(index);
    });

    return li;
}

function deleteTodoItem(index) {
    allTodos = allTodos.filter((_, i) => i !== index);
    saveTodos();
    updateTodoList();
}

function saveTodos() {
    localStorage.setItem("todos", JSON.stringify(allTodos));
    window.dispatchEvent(new CustomEvent('todosChanged'));
}

function getTodos() {
    return JSON.parse(localStorage.getItem("todos") || "[]");
}