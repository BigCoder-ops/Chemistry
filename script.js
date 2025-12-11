// Main Application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Export Progress functionality
    const exportBtn = document.getElementById('export-progress');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportProgress);
    }
    
    // Update status badges based on progress
    updateStatusBadges();
    
    // Add hover effects to feature cards
    addHoverEffects();
    
    // Initialize timeline interactions
    initTimeline();
});

function initApp() {
    console.log('Project Volta initialized');
    
    // Load user preferences
    const theme = localStorage.getItem('theme') || 'light';
    setTheme(theme);
    
    // Check deadlines
    checkUpcomingDeadlines();
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function checkUpcomingDeadlines() {
    // Mock data - in a real app, this would come from an API
    const deadlines = [
        { task: 'Problem Definition', date: '2025-12-15', daysLeft: 5 },
        { task: 'Scientific Background Draft', date: '2025-12-20', daysLeft: 10 }
    ];
    
    const urgentDeadlines = deadlines.filter(d => d.daysLeft <= 7);
    
    if (urgentDeadlines.length > 0) {
        showDeadlineNotification(urgentDeadlines);
    }
}

function showDeadlineNotification(deadlines) {
    const notification = document.createElement('div');
    notification.className = 'deadline-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
                <h4>Upcoming Deadlines</h4>
                ${deadlines.map(d => 
                    `<p>${d.task} - ${d.daysLeft} day${d.daysLeft !== 1 ? 's' : ''} left</p>`
                ).join('')}
            </div>
            <button class="close-notification">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS for notification
    const style = document.createElement('style');
    style.textContent = `
        .deadline-notification {
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 1rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.5s ease;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        
        .notification-content {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
        }
        
        .notification-content i {
            font-size: 1.5rem;
            margin-top: 0.25rem;
        }
        
        .notification-content h4 {
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .notification-content p {
            margin: 0.25rem 0;
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .close-notification {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
        }
    `;
    document.head.appendChild(style);
    
    // Close notification
    notification.querySelector('.close-notification').addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    });
}

function exportProgress() {
    // Create export data
    const exportData = {
        project: 'Critical Raw Materials & Batteries',
        lastUpdated: new Date().toISOString(),
        progress: {
            tasks: {
                total: 8,
                completed: 1,
                inProgress: 1,
                notStarted: 6
            },
            phases: {
                'I': 'In Progress',
                'II': 'Not Started',
                'III': 'Not Started',
                'IV': 'Not Started'
            }
        }
    };
    
    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-volta-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show success message
    alert('Progress exported successfully!');
}

function updateStatusBadges() {
    // This would update status badges based on actual progress data
    // For now, it's handled by the HTML/CSS
}

function addHoverEffects() {
    const cards = document.querySelectorAll('.feature-card, .action-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
}

function initTimeline() {
    const phases = document.querySelectorAll('.timeline-phase');
    phases.forEach(phase => {
        phase.addEventListener('click', function() {
            const phaseNumber = this.querySelector('.phase-marker').textContent;
            window.location.href = `tasks.html?filter=phase:${phaseNumber}`;
        });
        
        // Add cursor pointer
        phase.style.cursor = 'pointer';
    });
}

// Utility functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function calculateDaysLeft(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Local Storage functions
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Export for use in other modules
window.ProjectVolta = {
    formatDate,
    calculateDaysLeft,
    saveToLocalStorage,
    getFromLocalStorage
};
