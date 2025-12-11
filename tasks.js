// Tasks Management JavaScript

// Sample tasks data
const sampleTasks = [
    {
        id: 1,
        name: "Problem Definition & Literature Review",
        description: "Define the Wicked Problem: Critical Raw Materials and Batteries. Focus on unsustainability of current battery supply chains regarding geopolitical constraints and carbon footprint.",
        phase: "I",
        status: "in_progress",
        priority: "high",
        dueDate: "2025-12-15",
        deliverable: "Outline of Introduction/Scientific Background, Preliminary Bibliography (ACS Style)",
        progress: 75,
        relatedLiterature: [1, 2, 3],
        createdAt: "2025-12-01",
        updatedAt: "2025-12-05"
    },
    {
        id: 2,
        name: "Scientific Background Draft",
        description: "Write scientific background covering battery chemistry principles, redox reactions, electrochemical principles, and molecular structure-property relationships.",
        phase: "I",
        status: "not_started",
        priority: "high",
        dueDate: "2025-12-20",
        deliverable: "Complete Scientific Background section with chemical equations and thermodynamics",
        progress: 0,
        relatedLiterature: [4, 5],
        createdAt: "2025-12-01",
        updatedAt: "2025-12-01"
    },
    {
        id: 3,
        name: "Current Solutions Analysis",
        description: "Analyze existing battery technologies (LFP, NMC, NCA) and identify limitations from scientific, economic, and geopolitical perspectives.",
        phase: "II",
        status: "not_started",
        priority: "medium",
        dueDate: "2026-01-05",
        deliverable: "Section drafts: Current Solutions, Chemical Analysis",
        progress: 0,
        relatedLiterature: [6, 7],
        createdAt: "2025-12-01",
        updatedAt: "2025-12-01"
    },
    {
        id: 4,
        name: "Environmental/Economic/Societal Evaluation",
        description: "Comprehensive assessment of current battery life cycle including carbon footprint, toxicity, scalability, and geopolitical constraints.",
        phase: "II",
        status: "not_started",
        priority: "medium",
        dueDate: "2026-01-10",
        deliverable: "Environmental, Economic, and Societal evaluation sections",
        progress: 0,
        relatedLiterature: [8, 9],
        createdAt: "2025-12-01",
        updatedAt: "2025-12-01"
    },
    {
        id: 5,
        name: "Proposed Strategy Development",
        description: "Develop a low-carbon, geopolitically sustainable battery strategy focusing on alternative materials and circular pathways.",
        phase: "III",
        status: "not_started",
        priority: "medium",
        dueDate: "2026-01-15",
        deliverable: "Section drafts: Proposed Strategies, Key Trade-offs",
        progress: 0,
        relatedLiterature: [10, 11],
        createdAt: "2025-12-01",
        updatedAt: "2025-12-01"
    }
];

// Get tasks from localStorage or use sample data
function getTasks() {
    const savedTasks = localStorage.getItem('projectVoltaTasks');
    return savedTasks ? JSON.parse(savedTasks) : sampleTasks;
}

// Save tasks to localStorage
function saveTasks(tasks) {
    localStorage.setItem('projectVoltaTasks', JSON.stringify(tasks));
}

// Initialize tasks page
document.addEventListener('DOMContentLoaded', function() {
    const tasks = getTasks();
    renderTasks(tasks);
    setupEventListeners();
    setupFilters();
});

// Render tasks based on current view
function renderTasks(tasks, filter = 'all', view = 'list') {
    const container = document.getElementById('tasksContainer');
    container.className = `tasks-container ${view}-view`;
    
    // Filter tasks
    let filteredTasks = tasks;
    if (filter !== 'all') {
        const [key, value] = filter.split(':');
        filteredTasks = tasks.filter(task => task[key] === value);
    }
    
    // Clear container
    container.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>No tasks found</h3>
                <p>${filter === 'all' ? 'Add your first task to get started!' : 'No tasks match the selected filter.'}</p>
            </div>
        `;
        return;
    }
    
    // Render based on view
    if (view === 'board') {
        renderBoardView(filteredTasks, container);
    } else if (view === 'timeline') {
        renderTimelineView(filteredTasks, container);
    } else {
        renderListView(filteredTasks, container);
    }
}

// List View
function renderListView(tasks, container) {
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        container.appendChild(taskElement);
    });
}

// Board View
function renderBoardView(tasks, container) {
    const phases = {
        'I': { name: 'Phase I', tasks: [] },
        'II': { name: 'Phase II', tasks: [] },
        'III': { name: 'Phase III', tasks: [] },
        'IV': { name: 'Phase IV', tasks: [] },
        'V': { name: 'Phase V', tasks: [] }
    };
    
    // Group tasks by phase
    tasks.forEach(task => {
        if (phases[task.phase]) {
            phases[task.phase].tasks.push(task);
        }
    });
    
    // Create columns for each phase
    Object.entries(phases).forEach(([phaseId, phaseData]) => {
        if (phaseData.tasks.length > 0) {
            const column = document.createElement('div');
            column.className = 'board-column';
            column.innerHTML = `
                <div class="board-column-header">
                    <i class="fas fa-layer-group"></i>
                    ${phaseData.name}
                    <span class="task-count">(${phaseData.tasks.length})</span>
                </div>
            `;
            
            phaseData.tasks.forEach(task => {
                const taskElement = createTaskElement(task);
                column.appendChild(taskElement);
            });
            
            container.appendChild(column);
        }
    });
}

// Timeline View
function renderTimelineView(tasks, container) {
    // Sort tasks by due date
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    sortedTasks.forEach(task => {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${task.priority}-priority`;
        
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        timelineItem.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="task-header">
                    <div>
                        <h3 class="task-title">${task.name}</h3>
                        <span class="task-phase">Phase ${task.phase}</span>
                    </div>
                    <span class="task-status ${getStatusClass(task.status)}">${formatStatus(task.status)}</span>
                </div>
                <div class="task-description">${task.description}</div>
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Progress</span>
                        <span>${task.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                </div>
                <div class="task-footer">
                    <div class="task-due ${isUrgent(task.dueDate) ? 'urgent' : ''}">
                        <i class="far fa-calendar"></i> Due: ${formattedDate}
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn complete" onclick="completeTask(${task.id})" title="Mark Complete">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="task-action-btn edit" onclick="editTask(${task.id})" title="Edit Task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn delete" onclick="deleteTask(${task.id})" title="Delete Task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(timelineItem);
    });
}

// Create individual task element
function createTaskElement(task) {
    const element = document.createElement('div');
    element.className = `task-card ${task.priority}-priority`;
    element.setAttribute('data-task-id', task.id);
    
    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    element.innerHTML = `
        <div class="task-header">
            <div>
                <h3 class="task-title">${task.name}</h3>
                <span class="task-phase">Phase ${task.phase}</span>
            </div>
            <span class="task-status ${getStatusClass(task.status)}">${formatStatus(task.status)}</span>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="progress-container">
            <div class="progress-label">
                <span>Progress</span>
                <span>${task.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${task.progress}%"></div>
            </div>
        </div>
        <div class="task-meta">
            <span class="task-priority priority-${task.priority}">
                <i class="fas fa-exclamation-circle"></i> ${formatPriority(task.priority)}
            </span>
            <span>Deliverable: ${task.deliverable}</span>
        </div>
        <div class="task-footer">
            <div class="task-due ${isUrgent(task.dueDate) ? 'urgent' : ''}">
                <i class="far fa-calendar"></i> Due: ${formattedDate}
            </div>
            <div class="task-actions">
                <button class="task-action-btn complete" onclick="completeTask(${task.id})" title="Mark Complete">
                    <i class="fas fa-check"></i>
                </button>
                <button class="task-action-btn edit" onclick="editTask(${task.id})" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn view" onclick="viewTaskDetail(${task.id})" title="View Details">
                    <i class="fas
