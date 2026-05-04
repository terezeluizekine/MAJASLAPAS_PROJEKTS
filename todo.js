const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoListUL = document.getElementById('todo-list');

const PRIORITY_RANK = { high: 1, medium: 2, low: 3 };
const PRIORITY_LABEL = { high: 'Augsta', medium: 'Vidēja', low: 'Zema' };

let allTodos = getTodos();
sortTodos();
updateTodoList();

todoForm.addEventListener('submit', function(e){
    e.preventDefault();
    addTodo();
});

function addTodo(){
    const todoText = todoInput.value.trim();
    if(todoText.length > 0){
        const todoObject = {
            text: todoText,
            completed: false,
            deadline: null,
            priority: null
        };
        allTodos.push(todoObject);
        sortTodos();
        saveTodos();
        updateTodoList();
        todoInput.value = "";
    }
}

// Šķirošana: 1) termiņš, 2) prioritāte, 3) alfabētiski
function sortTodos(){
    allTodos.sort((a, b) => {
        const aHas = !!a.deadline;
        const bHas = !!b.deadline;
        if (aHas && bHas && a.deadline !== b.deadline) {
            return a.deadline.localeCompare(b.deadline);
        }
        if (aHas !== bHas) return aHas ? -1 : 1;

        const aPri = PRIORITY_RANK[a.priority] || 99;
        const bPri = PRIORITY_RANK[b.priority] || 99;
        if (aPri !== bPri) return aPri - bPri;

        return a.text.localeCompare(b.text, 'lv', { sensitivity: 'base' });
    });
}

function isOverdue(dateStr){
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
}

function updateTodoList(){
    todoListUL.innerHTML = "";
    allTodos.forEach((todo, todoIndex) => {
        const todoItem = createTodoItem(todo, todoIndex);
        todoListUL.append(todoItem);
    });
}

function createTodoItem(todo, todoIndex){
    const todoId = "todo-" + todoIndex;
    const todoLI = document.createElement("li");
    todoLI.className = "todo";
    if (todo.priority) todoLI.classList.add(`priority-${todo.priority}`);
    if (isOverdue(todo.deadline) && !todo.completed) todoLI.classList.add('overdue');

    todoLI.innerHTML = `
        <input type="checkbox" id="${todoId}">
        <label class="custom-checkbox" for="${todoId}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="transparent"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>
        </label>
        <label for="${todoId}" class="todo-text">${todo.text}</label>
        <select class="todo-priority-select" title="Prioritāte">
            <option value="" ${!todo.priority ? 'selected' : ''}>—</option>
            <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>Augsta</option>
            <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Vidēja</option>
            <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Zema</option>
        </select>
        <input type="date" class="todo-deadline-input" value="${todo.deadline || ''}" title="Termiņš">
        <button class="delete-button" title="Dzēst">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
        </button>
    `;

    const checkbox = todoLI.querySelector("input[type='checkbox']");
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => {
        allTodos[todoIndex].completed = checkbox.checked;
        saveTodos();
        updateTodoList();
    });

    const prioritySelect = todoLI.querySelector(".todo-priority-select");
    prioritySelect.addEventListener("change", () => {
        allTodos[todoIndex].priority = prioritySelect.value || null;
        sortTodos();
        saveTodos();
        updateTodoList();
    });

    const deadlineInput = todoLI.querySelector(".todo-deadline-input");
    deadlineInput.addEventListener("change", () => {
        allTodos[todoIndex].deadline = deadlineInput.value || null;
        sortTodos();
        saveTodos();
        updateTodoList();
    });

    const deleteButton = todoLI.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
        deleteTodoItem(todoIndex);
    });

    return todoLI;
}

function deleteTodoItem(todoIndex){
    allTodos = allTodos.filter((_, i) => i !== todoIndex);
    saveTodos();
    updateTodoList();
}

function saveTodos(){
    localStorage.setItem("todos", JSON.stringify(allTodos));
}

function getTodos(){
    const todos = localStorage.getItem("todos") || "[]";
    return JSON.parse(todos);
}