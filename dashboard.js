// Dashboard JavaScript - Integrated with Tasks

// Dashboard Configuration
const PROJECT_CONFIG = {
    phases: {
        'I': { 
            name: 'Foundation & Definition', 
            color: '#3b82f6',
            start: '2025-12-01',
            end: '2025-12-20'
        },
        'II': { 
            name: 'Analysis & Evaluation', 
            color: '#10b981',
            start: '2025-12-21', 
            end: '2026-01-10'
        },
        'III': { 
            name: 'Strategy & Synthesis', 
            color: '#f59e0b',
            start: '2026-01-11', 
            end: '2026-01-15'
        },
        'IV': { 
            name: 'Finalization', 
            color: '#8b5cf6',
            start: '2026-01-16', 
            end: '2026-01-22'
        },
        'V': { 
            name: 'Delivery', 
            color: '#ef4444',
            start: '2026-01-23', 
            end: '2026-01-25'
        }
    },
    finalDeadline: '2026-01-23'
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
});

// Main initialization function
function initializeDashboard() {
    updateLiveStats();
    renderTaskProgress();
    renderUrgentTasks();
    renderRecentActivity();
    renderProjectTimeline();
    initializeTaskDistributionChart();
    updateCountdown();
    
    // Update every 30 seconds for real-time feel
    setInterval(updateLiveStats, 30000);
}

// Get tasks from localStorage
function getTasks() {
    const savedTasks = localStorage.getItem('projectVoltaTasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
}

// Update live statistics
function updateLiveStats() {
    const tasks = getTasks();
    const statsContainer = document.getElementById('liveStats');
    
    if (!statsContainer) return;
    
    // Calculate statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'complete').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const notStartedTasks = tasks.filter(task => task.status === 'not_started').length;
    
    // Calculate urgent tasks (due in 3 days or less)
    const today = new Date();
    const urgentTasks = tasks.filter(task => {
        if (task.status === 'complete') return false;
        const dueDate = new Date(task.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3 && diffDays >= 0;
    }).length;
    
    // Update overall progress
    const overallProgress = totalTasks > 0 ? 
        Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('overallProgressPercent').textContent = `${overallProgress}%`;
    document.getElementById('overallProgressFill').style.width = `${overallProgress}%`;
    
    // Render stats cards
    statsContainer.innerHTML = `
        <div class="stat-card-live completed">
            <div class="stat-icon-live completed">
                <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-info-live">
                <h3>${completedTasks}</h3>
                <p>Completed Tasks</p>
            </div>
        </div>
        
        <div class="stat-card-live in-progress">
            <div class="stat-icon-live in-progress">
                <i class="fas fa-spinner"></i>
            </div>
            <div class="stat-info-live">
                <h3>${inProgressTasks}</h3>
                <p>In Progress</p>
            </div>
        </div>
        
        <div class="stat-card-live pending">
            <div class="stat-icon-live pending">
                <i class="fas fa-clock"></i>
            </div>
            <div class="stat-info-live">
                <h3>${notStartedTasks}</h3>
                <p>Not Started</p>
            </div>
        </div>
        
        <div class="stat-card-live urgent">
            <div class="stat-icon-live urgent">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="stat-info-live">
                <h3>${urgentTasks}</h3>
                <p>Urgent Tasks</p>
            </div>
        </div>
    `;
}

// Render task progress by phase
function renderTaskProgress() {
    const tasks = getTasks();
    const phaseGrid = document.querySelector('.phase-progress-grid');
    
    if (!phaseGrid) return;
    
    // Calculate progress for each phase
    let phaseProgressHTML = '';
    
    Object.entries(PROJECT_CONFIG.phases).forEach(([phaseId, phaseInfo]) => {
        const phaseTasks = tasks.filter(task => task.phase === phaseId);
        const completedPhaseTasks = phaseTasks.filter(task => task.status === 'complete').length;
        const phaseProgress = phaseTasks.length > 0 ? 
            Math.round((completedPhaseTasks / phaseTasks.length) * 100) : 0;
        
        phaseProgressHTML += `
            <div class="phase-progress-item" style="border-color: ${phaseInfo.color}20;">
                <h4>Phase ${phaseId}</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${phaseProgress}%; background: ${phaseInfo.color};"></div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; color: var(--gray-color);">${phaseTasks.length} tasks</span>
                    <span style="font-weight: 600; color: ${phaseInfo.color};">${phaseProgress}%</span>
                </div>
            </div>
        `;
    });
    
    phaseGrid.innerHTML = phaseProgressHTML;
}

// Render urgent tasks
function renderUrgentTasks() {
    const tasks = getTasks();
    const urgentContainer = document.getElementById('urgentTasks');
    
    if (!urgentContainer) return;
    
    const today = new Date();
    const urgentTasks = tasks.filter(task => {
        if (task.status === 'complete') return false;
        const dueDate = new Date(task.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0; // Due within 7 days
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5); // Show only 5 most urgent
    
    if (urgentTasks.length === 0) {
        urgentContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h4>No urgent tasks</h4>
                <p>All tasks are on schedule!</p>
            </div>
        `;
        return;
    }
    
    let urgentHTML = '';
    
    urgentTasks.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const formattedDate = dueDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        
        urgentHTML += `
            <div class="urgent-task-item">
                <div class="urgent-task-icon">
                    <i class="fas fa-exclamation"></i>
                </div>
                <div class="urgent-task-content">
                    <h4>${task.name}</h4>
                    <p>Due: ${formattedDate}</p>
                    <div class="urgent-task-meta">
                        <span class="phase-badge">Phase ${task.phase}</span>
                        <span class="days-left-badge">${diffDays} day${diffDays !== 1 ? 's' : ''} left</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    urgentContainer.innerHTML = urgentHTML;
}

// Render recent activity
function renderRecentActivity() {
    const activityContainer = document.getElementById('recentActivity');
    
    if (!activityContainer) return;
    
    // In a real app, this would come from an activity log
    // For now, we'll simulate recent activity based on tasks
    const tasks = getTasks();
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 3);
    
    if (recentTasks.length === 0) {
        activityContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h4>No recent activity</h4>
                <p>Start working on your project!</p>
            </div>
        `;
        return;
    }
    
    let activityHTML = '';
    
    recentTasks.forEach(task => {
        const lastUpdated = new Date(task.updatedAt);
        const timeAgo = getTimeAgo(lastUpdated);
        
        activityHTML += `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${getActivityIcon(task)}"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${getActivityText(task)}</strong></p>
                    <p>${task.name}</p>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            </div>
        `;
    });
    
    activityContainer.innerHTML = activityHTML;
}

// Render project timeline
function renderProjectTimeline() {
    const timelineContainer = document.getElementById('projectTimeline');
    
    if (!timelineContainer) return;
    
    let timelineHTML = '';
    const today = new Date();
    let currentPhase = 'I';
    
    // Determine current phase based on today's date
    Object.entries(PROJECT_CONFIG.phases).forEach(([phaseId, phaseInfo]) => {
        const phaseStart = new Date(phaseInfo.start);
        const phaseEnd = new Date(phaseInfo.end);
        
        if (today >= phaseStart && today <= phaseEnd) {
            currentPhase = phaseId;
        }
    });
    
    // Calculate phase progress
    const tasks = getTasks();
    const currentPhaseTasks = tasks.filter(task => task.phase === currentPhase);
    const completedCurrentTasks = currentPhaseTasks.filter(task => task.status === 'complete').length;
    const currentPhaseProgress = currentPhaseTasks.length > 0 ? 
        Math.round((completedCurrentTasks / currentPhaseTasks.length) * 100) : 0;
    
    // Update phase stats
    document.getElementById('phaseProgress').textContent = `${currentPhaseProgress}%`;
    document.getElementById('daysInPhase').textContent = getDaysInPhase(currentPhase);
    
    // Render timeline
    Object.entries(PROJECT_CONFIG.phases).forEach(([phaseId, phaseInfo]) => {
        const isActive = phaseId === currentPhase;
        const isPast = new Date(phaseInfo.end) < today;
        
        timelineHTML += `
            <div class="timeline-phase ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}">
                <div class="phase-marker" style="${isActive ? `border-color: ${phaseInfo.color}; background: ${phaseInfo.color};` : ''}">
                    ${phaseId}
                </div>
                <div class="phase-label">${phaseInfo.name}</div>
                <div class="phase-date">
                    ${formatDateRange(phaseInfo.start, phaseInfo.end)}
                </div>
            </div>
        `;
    });
    
    timelineContainer.innerHTML = timelineHTML;
}

// Initialize task distribution chart
function initializeTaskDistributionChart() {
    const tasks = getTasks();
    const ctx = document.getElementById('taskDistributionChart');
    
    if (!ctx) return;
    
    // Calculate distribution
    const statusCounts = {
        'complete': tasks.filter(t => t.status === 'complete').length,
        'in_progress': tasks.filter(t => t.status === 'in_progress').length,
        'not_started': tasks.filter(t => t.status === 'not_started').length,
        'overdue': tasks.filter(t => {
            if (t.status === 'complete') return false;
            const dueDate = new Date(t.dueDate);
            return dueDate < new Date();
        }).length
    };
    
    // Update legend
    const legendContainer = document.getElementById('taskDistributionLegend');
    if (legendContainer) {
        legendContainer.innerHTML = `
            <div class="legend-item">
                <div class="legend-color completed"></div>
                <span>Completed (${statusCounts.complete})</span>
            </div>
            <div class="legend-item">
                <div class="legend-color in-progress"></div>
                <span>In Progress (${statusCounts.in_progress})</span>
            </div>
            <div class="legend-item">
                <div class="legend-color not-started"></div>
                <span>Not Started (${statusCounts.not_started})</span>
            </div>
            <div class="legend-item">
                <div class="legend-color overdue"></div>
                <span>Overdue (${statusCounts.overdue})</span>
            </div>
        `;
    }
    
    // Create chart
    new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started', 'Overdue'],
            datasets: [{
                data: [statusCounts.complete, statusCounts.in_progress, statusCounts.not_started, statusCounts.overdue],
                backgroundColor: [
                    '#10b981',
                    '#3b82f6',
                    '#6b7280',
                    '#ef4444'
                ],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} tasks (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// Update final deadline countdown
function updateCountdown() {
    const finalDeadline = new Date(PROJECT_CONFIG.finalDeadline);
    const today = new Date();
    const diffTime = finalDeadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const countdownElement = document.getElementById('finalDeadlineCountdown');
    if (countdownElement) {
        countdownElement.textContent = diffDays > 0 ? diffDays : '0';
        
        // Add warning class if less than 30 days
        if (diffDays <= 30) {
            countdownElement.parentElement.parentElement.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Export data button
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDashboardData);
    }
    
    // Auto-refresh every minute
    setInterval(() => {
        updateLiveStats();
        renderTaskProgress();
        renderUrgentTasks();
        renderRecentActivity();
        initializeTaskDistributionChart();
    }, 60000);
}

// Helper functions
function getActivityIcon(task) {
    switch(task.status) {
        case 'complete': return 'check-circle';
        case 'in_progress': return 'spinner';
        case 'under_review': return 'eye';
        default: return 'edit';
    }
}

function getActivityText(task) {
    switch(task.status) {
        case 'complete': return 'Completed task';
        case 'in_progress': return 'Updated task';
        case 'under_review': return 'Submitted for review';
        default: return 'Started work on';
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
}

function formatDateRange(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()}-${end.getDate()}`;
    } else {
        return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
    }
}

function getDaysInPhase(phaseId) {
    const phaseInfo = PROJECT_CONFIG.phases[phaseId];
    if (!phaseInfo) return '0';
    
    const start = new Date(phaseInfo.start);
    const end = new Date(phaseInfo.end);
    const today = new Date();
    
    if (today < start) return '0';
    if (today > end) {
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return `${totalDays}`;
    }
    
    const daysSoFar = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    return `${daysSoFar}`;
}

// Export dashboard data
function exportDashboardData() {
    const tasks = getTasks();
    const dashboardData = {
        exportDate: new Date().toISOString(),
        project: 'Project Volta - Critical Raw Materials & Batteries',
        statistics: {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'complete').length,
            inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
            notStartedTasks: tasks.filter(t => t.status === 'not_started').length,
            urgentTasks: tasks.filter(t => {
                const dueDate = new Date(t.dueDate);
                const today = new Date();
                const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                return diffDays <= 3 && diffDays >= 0 && t.status !== 'complete';
            }).length
        },
        phases: Object.entries(PROJECT_CONFIG.phases).map(([id, info]) => {
            const phaseTasks = tasks.filter(t => t.phase === id);
            return {
                phase: id,
                name: info.name,
                taskCount: phaseTasks.length,
                completedCount: phaseTasks.filter(t => t.status === 'complete').length,
                progress: phaseTasks.length > 0 ? 
                    Math.round((phaseTasks.filter(t => t.status === 'complete').length / phaseTasks.length) * 100) : 0
            };
        }),
        urgentTasks: tasks.filter(t => {
            if (t.status === 'complete') return false;
            const dueDate = new Date(t.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }).map(t => ({
            name: t.name,
            phase: t.phase,
            dueDate: t.dueDate,
            status: t.status,
            priority: t.priority
        }))
    };
    
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-volta-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show notification
    showNotification('Dashboard data exported successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.dashboard-notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `dashboard-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles if needed
    if (!document.querySelector('#dashboard-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'dashboard-notification-styles';
        style.textContent = `
            .dashboard-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                color: var(--dark-color);
                padding: 1rem 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid var(--primary-color);
            }
            
            .dashboard-notification.success {
                border-left-color: #10b981;
            }
            
            .dashboard-notification i {
                font-size: 1.25rem;
            }
            
            .dashboard-notification.success i {
                color: #10b981;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make functions available globally
window.updateDashboard = initializeDashboard;
