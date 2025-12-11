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

// Get next task ID
function getNextTaskId(tasks) {
    return tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
}

// Global variables
let currentFilter = 'all';
let currentView = 'list';
let isEditing = false;
let editingTaskId = null;

// Initialize tasks page
document.addEventListener('DOMContentLoaded', function() {
    renderAllTasks();
    setupEventListeners();
    setupProgressSlider();
    setupDatePicker();
});

// Render all tasks with current filter and view
function renderAllTasks() {
    const tasks = getTasks();
    renderTasks(tasks, currentFilter, currentView);
}

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
        'I': { name: 'Phase I - Foundation', tasks: [] },
        'II': { name: 'Phase II - Analysis', tasks: [] },
        'III': { name: 'Phase III - Strategy', tasks: [] },
        'IV': { name: 'Phase IV - Finalization', tasks: [] },
        'V': { name: 'Phase V - Delivery', tasks: [] }
    };
    
    // Group tasks by phase
    tasks.forEach(task => {
        if (phases[task.phase]) {
            phases[task.phase].tasks.push(task);
        }
    });
    
    // Create columns for each phase
    Object.entries(phases).forEach(([phaseId, phaseData]) => {
        if (phaseData.tasks.length > 0 || currentFilter.includes(`phase:${phaseId}`)) {
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
                        <button class="task-action-btn view" onclick="viewTaskDetail(${task.id})" title="View Details">
                            <i class="fas fa-eye"></i>
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
            <span class="deliverable">${task.deliverable ? task.deliverable.substring(0, 50) + '...' : 'No deliverable specified'}</span>
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
                    <i class="fas fa-eye"></i>
                </button>
                <button class="task-action-btn delete" onclick="deleteTask(${task.id})" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    return element;
}

// Setup event listeners
function setupEventListeners() {
    // Add task button
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', showAddTaskModal);
    }
    
    // Close modal buttons
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', hideAddTaskModal);
    });
    
    const closeDetailModalBtn = document.querySelector('.close-detail-modal');
    if (closeDetailModalBtn) {
        closeDetailModalBtn.addEventListener('click', hideTaskDetailModal);
    }
    
    // Task form submission
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }
    
    // Modal background click to close
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'addTaskModal') {
                    hideAddTaskModal();
                } else {
                    hideTaskDetailModal();
                }
            }
        });
    });
}

// Setup filter buttons
function setupFilters() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all filter buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current filter
            currentFilter = this.getAttribute('data-filter');
            renderAllTasks();
        });
    });
    
    // View buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all view buttons
            viewButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Update current view
            currentView = this.getAttribute('data-view');
            renderAllTasks();
        });
    });
}

// Setup progress slider
function setupProgressSlider() {
    const progressSlider = document.getElementById('taskProgress');
    const progressValue = document.getElementById('progressValue');
    
    if (progressSlider && progressValue) {
        progressSlider.addEventListener('input', function() {
            progressValue.textContent = this.value + '%';
        });
    }
}

// Setup date picker
function setupDatePicker() {
    const dueDateInput = document.getElementById('taskDueDate');
    if (dueDateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
        
        // Set default date to 7 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        dueDateInput.value = defaultDate.toISOString().split('T')[0];
    }
}

// Show add task modal
function showAddTaskModal() {
    isEditing = false;
    editingTaskId = null;
    
    const modal = document.getElementById('addTaskModal');
    const form = document.getElementById('taskForm');
    
    // Reset form
    if (form) {
        form.reset();
        document.getElementById('taskProgress').value = 0;
        document.getElementById('progressValue').textContent = '0%';
        setupDatePicker(); // Reset date picker
    }
    
    // Update modal title
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Task';
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide add task modal
function hideAddTaskModal() {
    const modal = document.getElementById('addTaskModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Show task detail modal
function showTaskDetailModal() {
    const modal = document.getElementById('taskDetailModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Hide task detail modal
function hideTaskDetailModal() {
    const modal = document.getElementById('taskDetailModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Handle task form submission
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const tasks = getTasks();
    
    // Get form values
    const taskData = {
        id: isEditing ? editingTaskId : getNextTaskId(tasks),
        name: document.getElementById('taskName').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        phase: document.getElementById('taskPhase').value,
        status: document.getElementById('taskStatus').value,
        priority: document.getElementById('taskPriority').value,
        dueDate: document.getElementById('taskDueDate').value,
        deliverable: document.getElementById('taskDeliverable').value.trim(),
        progress: parseInt(document.getElementById('taskProgress').value),
        relatedLiterature: [],
        createdAt: isEditing ? tasks.find(t => t.id === editingTaskId)?.createdAt || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    };
    
    if (isEditing) {
        // Update existing task
        const index = tasks.findIndex(t => t.id === editingTaskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
        }
    } else {
        // Add new task
        tasks.push(taskData);
    }
    
    // Save tasks
    saveTasks(tasks);
    
    // Hide modal and refresh display
    hideAddTaskModal();
    renderAllTasks();
    
    // Show success message
    showNotification(isEditing ? 'Task updated successfully!' : 'Task added successfully!', 'success');
}

// Edit task
function editTask(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    isEditing = true;
    editingTaskId = taskId;
    
    // Fill form with task data
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDescription').value = task.description;
    document.getElementById('taskPhase').value = task.phase;
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.dueDate;
    document.getElementById('taskDeliverable').value = task.deliverable || '';
    document.getElementById('taskProgress').value = task.progress;
    document.getElementById('progressValue').textContent = task.progress + '%';
    
    // Update modal title
    const modal = document.getElementById('addTaskModal');
    const modalTitle = modal.querySelector('h2');
    if (modalTitle) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Task';
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// View task details
function viewTaskDetail(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    const dueDate = new Date(task.dueDate);
    const formattedDate = dueDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const createdDate = new Date(task.createdAt);
    const updatedDate = new Date(task.updatedAt);
    
    const detailContent = document.getElementById('taskDetailContent');
    detailContent.innerHTML = `
        <div class="detail-section">
            <h3><i class="fas fa-info-circle"></i> Task Information</h3>
            <div class="detail-description">
                ${task.description}
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-cogs"></i> Task Details</h3>
            <div class="detail-info">
                <div class="detail-item">
                    <div class="label">Phase</div>
                    <div class="value">Phase ${task.phase} - ${getPhaseName(task.phase)}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Status</div>
                    <div class="value ${getStatusClass(task.status)}">${formatStatus(task.status)}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Priority</div>
                    <div class="value priority-${task.priority}">${formatPriority(task.priority)}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Progress</div>
                    <div class="value">${task.progress}%</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-calendar-alt"></i> Timeline</h3>
            <div class="detail-info">
                <div class="detail-item">
                    <div class="label">Due Date</div>
                    <div class="value ${isUrgent(task.dueDate) ? 'urgent' : ''}">${formattedDate}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Created</div>
                    <div class="value">${createdDate.toLocaleDateString()}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Last Updated</div>
                    <div class="value">${updatedDate.toLocaleDateString()}</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-file-export"></i> Deliverable</h3>
            <p>${task.deliverable || 'No deliverable specified'}</p>
        </div>
        
        <div class="detail-section">
            <h3><i class="fas fa-tools"></i> Actions</h3>
            <div class="detail-actions">
                <button class="btn btn-primary" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i> Edit Task
                </button>
                <button class="btn btn-secondary" onclick="completeTask(${task.id})">
                    <i class="fas fa-check"></i> Mark Complete
                </button>
                <button class="btn btn-danger" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Delete Task
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('detailTaskName').textContent = task.name;
    showTaskDetailModal();
}

// Complete task
function completeTask(taskId) {
    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return;
    
    tasks[taskIndex].status = 'complete';
    tasks[taskIndex].progress = 100;
    tasks[taskIndex].updatedAt = new Date().toISOString().split('T')[0];
    
    saveTasks(tasks);
    renderAllTasks();
    showNotification('Task marked as complete!', 'success');
}

// Delete task
function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    const tasks = getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    
    saveTasks(filteredTasks);
    renderAllTasks();
    showNotification('Task deleted successfully!', 'success');
}

// Helper functions
function getStatusClass(status) {
    const statusClasses = {
        'not_started': 'status-not-started',
        'in_progress': 'status-in-progress',
        'under_review': 'status-under-review',
        'complete': 'status-complete'
    };
    return statusClasses[status] || '';
}

function formatStatus(status) {
    const statusMap = {
        'not_started': 'Not Started',
        'in_progress': 'In Progress',
        'under_review': 'Under Review',
        'complete': 'Complete'
    };
    return statusMap[status] || status;
}

function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function getPhaseName(phase) {
    const phases = {
        'I': 'Foundation & Definition',
        'II': 'Analysis & Evaluation',
        'III': 'Strategy & Synthesis',
        'IV': 'Finalization',
        'V': 'Delivery'
    };
    return phases[phase] || `Phase ${phase}`;
}

function isUrgent(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-toast {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                color: var(--dark-color);
                padding: 1rem 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid var(--primary-color);
            }
            
            .notification-toast.success {
                border-left-color: #10b981;
            }
            
            .notification-toast.error {
                border-left-color: #ef4444;
            }
            
            .notification-toast.warning {
                border-left-color: #f59e0b;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .notification-toast i {
                font-size: 1.25rem;
            }
            
            .notification-toast.success i {
                color: #10b981;
            }
            
            .notification-toast.error i {
                color: #ef4444;
            }
            
            .notification-toast.warning i {
                color: #f59e0b;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        
        // Add slideOut animation if not present
        if (!document.querySelector('#slideOutAnimation')) {
            const slideOutStyle = document.createElement('style');
            slideOutStyle.id = 'slideOutAnimation';
            slideOutStyle.textContent = `
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(slideOutStyle);
        }
        
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Export tasks functionality
function exportTasks() {
    const tasks = getTasks();
    const exportData = {
        project: 'Project Volta - Critical Raw Materials & Batteries',
        exportDate: new Date().toISOString(),
        taskCount: tasks.length,
        tasks: tasks
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-volta-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Tasks exported successfully!', 'success');
}

// Import tasks functionality
function importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.tasks && Array.isArray(importedData.tasks)) {
                saveTasks(importedData.tasks);
                renderAllTasks();
                showNotification('Tasks imported successfully!', 'success');
            } else {
                showNotification('Invalid file format', 'error');
            }
        } catch (error) {
            showNotification('Error importing tasks', 'error');
        }
    };
    reader.readAsText(file);
}

// Add export/import buttons to the page
function addExportImportButtons() {
    const controls = document.querySelector('.tasks-controls');
    if (controls) {
        const exportImportDiv = document.createElement('div');
        exportImportDiv.className = 'export-import-controls';
        exportImportDiv.innerHTML = `
            <button class="export-btn" onclick="exportTasks()" title="Export Tasks">
                <i class="fas fa-download"></i> Export
            </button>
            <label class="import-btn" title="Import Tasks">
                <i class="fas fa-upload"></i> Import
                <input type="file" accept=".json" onchange="importTasks(event)" style="display: none;">
            </label>
        `;
        controls.appendChild(exportImportDiv);
        
        // Add styles for export/import buttons
        const style = document.createElement('style');
        style.textContent = `
            .export-import-controls {
                display: flex;
                gap: 0.5rem;
            }
            
            .export-btn, .import-btn {
                padding: 0.5rem 1rem;
                border: 2px solid var(--border-color);
                background: white;
                border-radius: 0.5rem;
                font-weight: 500;
                color: var(--gray-color);
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .export-btn:hover, .import-btn:hover {
                border-color: var(--primary-color);
                color: var(--primary-color);
            }
            
            .import-btn {
                position: relative;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize export/import buttons when page loads
document.addEventListener('DOMContentLoaded', function() {
    addExportImportButtons();
});

// Make functions available globally
window.completeTask = completeTask;
window.editTask = editTask;
window.viewTaskDetail = viewTaskDetail;
window.deleteTask = deleteTask;
window.exportTasks = exportTasks;
window.importTasks = importTasks;
