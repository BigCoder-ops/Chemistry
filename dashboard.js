// Dashboard-specific JavaScript

function initProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    const progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Nov 30', 'Dec 7', 'Dec 14', 'Dec 21', 'Dec 28', 'Jan 4', 'Jan 11', 'Jan 18'],
            datasets: [
                {
                    label: 'Task Completion',
                    data: [0, 5, 12, 25, 25, 25, 40, 65],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Target',
                    data: [0, 10, 20, 30, 40, 50, 60, 80],
                    borderColor: '#10b981',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Handle view change
    document.getElementById('progress-view').addEventListener('change', function(e) {
        if (e.target.value === 'phases') {
            progressChart.data.labels = ['Phase I', 'Phase II', 'Phase III', 'Phase IV'];
            progressChart.data.datasets[0].data = [25, 0, 0, 0];
            progressChart.data.datasets[1].data = [100, 100, 100, 100];
        } else {
            progressChart.data.labels = ['Nov 30', 'Dec 7', 'Dec 14', 'Dec 21', 'Dec 28', 'Jan 4', 'Jan 11', 'Jan 18'];
            progressChart.data.datasets[0].data = [0, 5, 12, 25, 25, 25, 40, 65];
            progressChart.data.datasets[1].data = [0, 10, 20, 30, 40, 50, 60, 80];
        }
        progressChart.update();
    });
}

function initChemistryCharts() {
    // Energy Density Chart
    const energyCtx = document.getElementById('energyDensityChart').getContext('2d');
    new Chart(energyCtx, {
        type: 'bar',
        data: {
            labels: ['NMC', 'LFP', 'Na-ion', 'Solid-state'],
            datasets: [{
                label: 'Energy Density (Wh/kg)',
                data: [250, 160, 120, 300],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    'rgb(37, 99, 235)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(139, 92, 246)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Wh/kg'
                    }
                }
            }
        }
    });
    
    // Material Availability Chart
    const materialCtx = document.getElementById('materialChart').getContext('2d');
    new Chart(materialCtx, {
        type: 'doughnut',
        data: {
            labels: ['Lithium', 'Cobalt', 'Nickel', 'Graphite', 'Manganese'],
            datasets: [{
                data: [21, 7, 95, 300, 1500],
                backgroundColor: [
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(107, 114, 128, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
    
    // Recycling Chart
    const recyclingCtx = document.getElementById('recyclingChart').getContext('2d');
    new Chart(recyclingCtx, {
        type: 'radar',
        data: {
            labels: ['Technical', 'Economic', 'Environmental', 'Policy', 'Infrastructure'],
            datasets: [
                {
                    label: 'Current State',
                    data: [60, 40, 70, 30, 50],
                    borderColor: 'rgb(37, 99, 235)',
                    backgroundColor: 'rgba(37, 99, 235, 0.2)',
                    borderWidth: 2
                },
                {
                    label: 'Target',
                    data: [90, 80, 95, 85, 90],
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Update deadline days
function updateDeadlineDays() {
    const deadlineItems = document.querySelectorAll('.deadline-item');
    deadlineItems.forEach(item => {
        const daysLeftSpan = item.querySelector('.days-left');
        if (daysLeftSpan) {
            const currentText = daysLeftSpan.textContent;
            const daysMatch = currentText.match(/(\d+)/);
            if (daysMatch) {
                const days = parseInt(daysMatch[1]);
                if (days > 0) {
                    const newDays = days - 1;
                    daysLeftSpan.textContent = newDays + ' day' + (newDays !== 1 ? 's' : '') + ' left';
                    
                    // Update urgency
                    if (newDays <= 3) {
                        item.classList.add('urgent');
                    }
                }
            }
        }
    });
}

// Simulate daily update
setInterval(updateDeadlineDays, 86400000); // 24 hours in milliseconds

// Export progress function for dashboard
function exportProgress() {
    const exportData = {
        dashboard: 'Project Volta Dashboard',
        exportDate: new Date().toISOString(),
        progress: {
            tasksCompleted: 1,
            tasksInProgress: 1,
            upcomingDeadlines: 2,
            recentActivities: 3
        },
        charts: {
            progress: 'captured',
            chemistry: 'captured'
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
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
    showExportNotification();
}

function showExportNotification() {
    const notification = document.createElement('div');
    notification.className = 'export-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>Dashboard data exported successfully!</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .export-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideUp 0.5s ease;
        }
        
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        .export-notification .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .export-notification i {
            font-size: 1.25rem;
        }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.5s ease forwards';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers to quick links
    const quickLinks = document.querySelectorAll('.quick-link');
    quickLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.href || this.href === '#') {
                e.preventDefault();
            }
        });
    });
});
