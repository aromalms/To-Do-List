const inputBox = document.getElementById("input-box");
const timeBox = document.getElementById("time-box");
const listContainer = document.getElementById("list-container");
const addButton = document.getElementById("add-button");
const sortButton = document.getElementById("sort-button");
let editMode = null;

addButton.addEventListener("click", addingToList);

// Add a new task or update an existing one
function addingToList() {
    let taskText = inputBox.value.trim();
    let taskTime = timeBox.value;

    if (taskText === '') {
        alert("Please enter a task.");
        return;
    }

    if (taskText.length > 40) {
        alert("Character limit reached! Task should be within 40 characters.");
        return;
    }

    if (!taskTime) {
        alert("Please select a date and time.");
        return;
    }

    if (editMode) {
        editMode.querySelector(".task-text").textContent = taskText;
        editMode.dataset.userTime = taskTime;
        editMode.querySelector(".task-tooltip").textContent = `Due: ${formatDateTime(taskTime)}`;
        editMode = null;
    } else {
        let li = createTaskElement(taskText, taskTime);
        li.classList.add("new-task");
        listContainer.appendChild(li);
    }

    inputBox.value = "";
    timeBox.value = "";
    saveData();
    updateSortButtonState();
}

// Create a task element
function createTaskElement(taskText, userTime) {
    let li = document.createElement("li");
    li.classList.add("task-item");
    li.dataset.userTime = userTime;

    let taskSpan = document.createElement("span");
    taskSpan.textContent = taskText;
    taskSpan.classList.add("task-text");

    let timeTooltip = document.createElement("div");
    timeTooltip.textContent = `Due: ${formatDateTime(userTime)}`;
    timeTooltip.classList.add("task-tooltip");
    timeTooltip.style.display = "none";
    li.appendChild(timeTooltip);

    li.addEventListener("mouseenter", () => timeTooltip.style.display = "block");
    li.addEventListener("mouseleave", () => timeTooltip.style.display = "none");

    li.appendChild(taskSpan);
    appendButtons(li);
    return li;
}

// Append edit and delete buttons to a task
function appendButtons(li) {
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    let editBtn = document.createElement("span");
    editBtn.innerHTML = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.onclick = function(event) {
        event.stopPropagation();
        inputBox.value = li.querySelector(".task-text").textContent;
        timeBox.value = li.dataset.userTime;
        editMode = li;
    };

    let deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = '\u00d7';
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = function(event) {
        event.stopPropagation();
        li.remove();
        saveData();
        updateSortButtonState();
    };

    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);
    li.appendChild(buttonContainer);
}

// Format date-time for display
function formatDateTime(dateTimeString) {
    let dateObj = new Date(dateTimeString);
    return dateObj.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// Sort tasks based on due date and keep completed tasks at the bottom
function sortTasks() {
    let tasks = [...document.querySelectorAll("#list-container li")];
    let uncheckedTasks = tasks.filter(task => !task.classList.contains("checked"));
    let checkedTasks = tasks.filter(task => task.classList.contains("checked"));

    uncheckedTasks.sort((a, b) => new Date(a.dataset.userTime) - new Date(b.dataset.userTime));

    listContainer.innerHTML = "";
    uncheckedTasks.forEach(task => listContainer.appendChild(task));
    checkedTasks.forEach(task => listContainer.appendChild(task));

    saveData();
}

// Toggle task completion
listContainer.addEventListener("click", function(e) {
    if (e.target.tagName === "LI" || e.target.classList.contains("task-text")) {
        let li = e.target.closest("li");
        li.classList.toggle("checked");
        saveData();
    }
}, false);

// Save tasks to localStorage
function saveData() {
    let tasks = [];
    document.querySelectorAll("#list-container li").forEach(li => {
        tasks.push({
            text: li.querySelector(".task-text").textContent,
            userTime: li.dataset.userTime,
            checked: li.classList.contains("checked")
        });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Load tasks from localStorage
function showTask() {
    listContainer.innerHTML = "";
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(task => {
        let li = createTaskElement(task.text, task.userTime);
        if (task.checked) li.classList.add("checked");
        listContainer.appendChild(li);
    });
    updateSortButtonState();
}

// Enable or disable sort button
function updateSortButtonState() {
    sortButton.disabled = listContainer.children.length === 0;
}

// Initialize tasks on page load
document.addEventListener("DOMContentLoaded", showTask);
sortButton.addEventListener("click", sortTasks);
