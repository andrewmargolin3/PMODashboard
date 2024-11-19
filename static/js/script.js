let selectedTaskId = null; // Track the selected task for deletion
let isDarkMode = false;

// Color mapping for categories
const categoryColors = {
    design: "#ff8c00",
    development: "#6c63ff",
    testing: "#4caf50"
};

// Function to render the Gantt chart
function renderGanttChart(tasks) {
    const tooltip = d3.select("#tooltip"); // Tooltip element

    d3.select("#gantt-chart").selectAll("*").remove(); // Clear existing chart

    const svgWidth = 800;
    const svgHeight = tasks.length ? tasks.length * 30 + 60 : 100;

    const minDate = tasks.length ? d3.min(tasks, d => new Date(d.start_date)) : new Date();
    const maxDate = tasks.length ? d3.max(tasks, d => new Date(d.end_date)) : new Date();

    const timeScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([0, svgWidth - 100]);

    const svg = d3.select("#gantt-chart").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const taskGroups = svg.selectAll(".task-group")
        .data(tasks)
        .enter()
        .append("g")
        .attr("class", "task-group");

    taskGroups.append("rect")
        .attr("x", d => timeScale(new Date(d.start_date)))
        .attr("y", (d, i) => i * 30 + 40)
        .attr("width", d => timeScale(new Date(d.end_date)) - timeScale(new Date(d.start_date)))
        .attr("height", 20)
        .attr("class", "task-bar")
        .attr("fill", d => categoryColors[d.category] || "#6c63ff")
        .attr("rx", 5)
        .attr("ry", 5)
        .on("mouseover", (event, d) => {
            // Display tooltip with task details
            tooltip.style("display", "block")
                .html(`
                    <strong>${d.name}</strong><br/>
                    <em>Category:</em> ${d.category}<br/>
                    <em>Start:</em> ${d.start_date}<br/>
                    <em>End:</em> ${d.end_date}<br/>
                    <em>Progress:</em> ${d.progress}%
                `)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`);
        })
        .on("mousemove", (event) => {
            // Update tooltip position
            tooltip.style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseout", () => {
            tooltip.style("display", "none"); // Hide tooltip
        })
        .on("click", (event, d) => showDeleteButton(event, d.id));

    taskGroups.append("text")
        .attr("x", d => timeScale(new Date(d.start_date)) + (timeScale(new Date(d.end_date)) - timeScale(new Date(d.start_date))) / 2)
        .attr("y", (d, i) => i * 30 + 54)
        .attr("class", "task-label")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .text(d => d.name || "Unnamed Task");
}

// Open the add task modal
function openTaskModal() {
    document.getElementById("task-modal").style.display = "block";
    document.getElementById("modal-overlay").style.display = "block";
}

// Close the add task modal
function closeTaskModal() {
    document.getElementById("task-modal").style.display = "none";
    document.getElementById("modal-overlay").style.display = "none";
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.style.background = isDarkMode ? "#333" : "linear-gradient(135deg, #f9fafc, #e9ecf2)";
    document.body.style.color = isDarkMode ? "#ddd" : "#333";
    document.getElementById("page-title").style.color = isDarkMode ? "#ddd" : "#333";
}

// Submit task data to the server
function submitTask() {
    const name = document.getElementById("task-name").value;
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    const category = document.getElementById("task-category").value;
    const progress = document.getElementById("task-progress").value;

    // Validate input fields
    if (!name || !startDate || !endDate || !category || progress === "") {
        alert("Please fill in all fields.");
        return;
    }

    // Convert dates to YYYY-MM-DD format
    const startDateFormatted = new Date(startDate).toISOString().split('T')[0];
    const endDateFormatted = new Date(endDate).toISOString().split('T')[0];

    console.log("Submitting task:", { name, startDateFormatted, endDateFormatted, category, progress });

    fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name,
            start_date: startDateFormatted,
            end_date: endDateFormatted,
            category,
            progress
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || "Server error"); });
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        closeTaskModal();
        loadTasks();
    })
    .catch(error => {
        console.error("Error adding task:", error);
        alert(`Failed to add task: ${error.message}`);
    });
}

// Load tasks from the server
function loadTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            console.log("Tasks loaded:", tasks);
            renderGanttChart(tasks);
            hideDeleteButton();
        })
        .catch(error => console.error("Error loading tasks:", error));
}

// Show delete button next to a selected task
function showDeleteButton(event, taskId) {
    selectedTaskId = taskId;
    const deleteButton = document.getElementById("delete-button");
    deleteButton.style.left = `${event.pageX}px`;
    deleteButton.style.top = `${event.pageY - 10}px`;
    deleteButton.classList.add("show");
    deleteButton.style.display = "block";
}

// Confirm deletion of the selected task
function confirmDelete() {
    if (    selectedTaskId) {
        deleteTask(selectedTaskId);
        hideDeleteButton();
    }
}

// Delete a task from the server
function deleteTask(id) {
    fetch(`/tasks/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || "Server error"); });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            loadTasks();
        })
        .catch(error => {
            console.error("Error deleting task:", error);
            alert(`Failed to delete task: ${error.message}`);
        });
}

// Hide the delete button
function hideDeleteButton() {
    const deleteButton = document.getElementById("delete-button");
    deleteButton.classList.remove("show");
    deleteButton.style.display = "none";
    selectedTaskId = null;
}

// Hide delete button if clicking outside
document.addEventListener("click", function(event) {
    if (!event.target.closest(".task-bar") && !event.target.closest("#delete-button")) {
        hideDeleteButton();
    }
});

// Initial load of tasks
loadTasks();

