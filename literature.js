// Literature Management System - COMPLETE FIXED VERSION

class LiteratureManager {
    constructor() {
        this.STORAGE_KEY = 'project_volta_literature';
        this.currentView = 'grid';
        this.currentFilter = 'all';
        this.currentCategory = null;
        this.currentSearch = '';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.literatureData = [];
        this.deletingId = null;
        this.editingId = null;
        this.viewingId = null;
        
        console.log('LiteratureManager initialized');
    }
    
    async initialize() {
        console.log('Initializing...');
        // Load data
        await this.loadData();
        
        // Initialize UI
        this.initializeUI();
        
        // Render everything
        this.render();
        
        // Add event listeners
        this.addEventListeners();
        this.delegateEvents();
        
        console.log('Initialization complete');
    }
    
    initializeUI() {
        // Hide loading indicator
        document.getElementById('loading-indicator').style.display = 'none';
        
        // Set current year as default
        document.getElementById('literature-year').value = new Date().getFullYear();
    }
    
    async loadData() {
        console.log('Loading data...');
        // Show loading indicator
        document.getElementById('loading-indicator').style.display = 'block';
        
        try {
            // Try to load from localStorage first
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            
            if (savedData) {
                this.literatureData = JSON.parse(savedData);
                console.log('Loaded from localStorage:', this.literatureData.length, 'items');
            } else {
                console.log('No localStorage data, loading from JSON...');
                // Load initial data from JSON file
                try {
                    const response = await fetch('literature-db.json');
                    if (response.ok) {
                        this.literatureData = await response.json();
                        console.log('Loaded from JSON:', this.literatureData.length, 'items');
                        this.saveToStorage();
                    } else {
                        throw new Error('JSON file not found');
                    }
                } catch (error) {
                    console.log('Loading sample data instead...');
                    // Load sample data if JSON file doesn't exist
                    this.literatureData = this.getSampleData();
                    this.saveToStorage();
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.literatureData = this.getSampleData();
            this.saveToStorage();
        }
        
        // Hide loading indicator
        document.getElementById('loading-indicator').style.display = 'none';
        
        // Update statistics
        this.updateStatistics();
    }
    
    getSampleData() {
        return [
            {
                id: 1,
                title: "Advanced Electrochemical Energy Storage Technologies: A Comprehensive Review",
                authors: "Zhang, L.; Wang, H.; Chen, X.; Liu, Y.; Patel, R.",
                year: 2024,
                journal: "Nature Energy",
                volume: "9",
                pages: "123-145",
                abstract: "This comprehensive review covers recent advancements in electrochemical energy storage systems, focusing on next-generation battery technologies and supercapacitors. The paper discusses material innovations, performance metrics, and future challenges in the field, providing insights into sustainable energy solutions for the coming decades.",
                tags: ["electrochemistry", "battery", "energy storage", "review", "sustainability"],
                doi: "10.1038/s41560-024-01455-2",
                url: "https://doi.org/10.1038/s41560-024-01455-2",
                status: "reviewed",
                priority: "high",
                saved: true,
                notes: "Excellent review of current technologies. Need to follow up on solid-state battery section.",
                addedDate: "2024-01-15"
            },
            {
                id: 2,
                title: "Solid-State Batteries: Materials Engineering and Interface Design",
                authors: "Miller, J.; Thompson, R.; Davis, K.; Rodriguez, A.; Tanaka, S.",
                year: 2023,
                journal: "Science Advances",
                volume: "9",
                pages: "eabg3156",
                abstract: "This research investigates the materials science behind solid-state batteries, with emphasis on interface engineering between solid electrolytes and electrodes. The study presents novel characterization techniques for interface analysis and proposes solutions for overcoming current limitations in solid-state battery technology through advanced material design.",
                tags: ["battery", "materials", "solid-state", "interface", "engineering"],
                doi: "10.1126/sciadv.adh3156",
                url: "https://doi.org/10.1126/sciadv.adh3156",
                status: "cited",
                priority: "high",
                saved: true,
                notes: "Key paper for understanding interface challenges in solid-state batteries.",
                addedDate: "2023-11-20"
            }
        ];
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.literatureData));
            this.updateStatistics();
            console.log('Data saved to storage');
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }
    
    updateStatistics() {
        const total = this.literatureData.length;
        const saved = this.literatureData.filter(item => item.saved).length;
        const recent = this.literatureData.filter(item => item.year >= 2023).length;
        const journals = [...new Set(this.literatureData.map(item => item.journal))].length;
        
        document.getElementById('total-papers').textContent = total;
        document.getElementById('saved-papers').textContent = saved;
        document.getElementById('recent-papers').textContent = recent;
        document.getElementById('journals-count').textContent = journals;
    }
    
    render() {
        console.log('Rendering...');
        // Filter data based on current settings
        let filteredData = this.filterData();
        
        // Update empty state
        const emptyState = document.getElementById('empty-state');
        if (filteredData.length === 0) {
            emptyState.style.display = 'block';
            document.getElementById('pagination').style.display = 'none';
            if (this.currentView === 'grid') {
                document.getElementById('literature-container').innerHTML = '';
                document.getElementById('literature-container').style.display = 'none';
                document.getElementById('literature-list').style.display = 'none';
            } else {
                document.getElementById('list-body').innerHTML = '';
                document.getElementById('literature-list').style.display = 'none';
                document.getElementById('literature-container').style.display = 'none';
            }
            return;
        } else {
            emptyState.style.display = 'none';
        }
        
        // Paginate data
        const totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        // Render based on current view
        if (this.currentView === 'grid') {
            this.renderGridView(paginatedData);
            document.getElementById('literature-container').style.display = 'grid';
            document.getElementById('literature-list').style.display = 'none';
        } else {
            this.renderListView(paginatedData);
            document.getElementById('literature-list').style.display = 'block';
            document.getElementById('literature-container').style.display = 'none';
        }
        
        // Render pagination if needed
        if (filteredData.length > this.itemsPerPage) {
            this.renderPagination(totalPages);
            document.getElementById('pagination').style.display = 'flex';
        } else {
            document.getElementById('pagination').style.display = 'none';
        }
    }
    
    filterData() {
        let filtered = [...this.literatureData];
        
        // Apply search filter
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(searchLower) ||
                item.authors.toLowerCase().includes(searchLower) ||
                item.journal.toLowerCase().includes(searchLower) ||
                item.abstract.toLowerCase().includes(searchLower) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                (item.doi && item.doi.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply status filter
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'saved') {
                filtered = filtered.filter(item => item.saved);
            } else if (this.currentFilter === 'recent') {
                filtered = filtered.filter(item => item.year >= 2023);
            } else {
                filtered = filtered.filter(item => item.status === this.currentFilter);
            }
        }
        
        // Apply category filter
        if (this.currentCategory) {
            filtered = filtered.filter(item => 
                item.tags.some(tag => tag.toLowerCase() === this.currentCategory.toLowerCase())
            );
        }
        
        // Sort by year (newest first)
        filtered.sort((a, b) => b.year - a.year);
        
        return filtered;
    }
    
    renderGridView(data) {
        const container = document.getElementById('literature-container');
        container.innerHTML = '';
        
        data.forEach(item => {
            const card = this.createCardElement(item);
            container.appendChild(card);
        });
    }
    
    createCardElement(item) {
        const card = document.createElement('div');
        card.className = 'literature-card';
        card.dataset.id = item.id;
        
        // Format authors for display
        const authors = item.authors.split(';')[0];
        const authorCount = item.authors.split(';').length;
        const authorsDisplay = authorCount > 1 ? `${authors} et al.` : authors;
        
        // Create tags HTML
        const tagsHTML = item.tags.slice(0, 3).map(tag => 
            `<span class="card-tag">${tag}</span>`
        ).join('');
        
        // Create status badge
        const statusClass = `status-${item.status}`;
        const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${item.title}</h3>
                <p class="card-authors">${authorsDisplay} ${authorCount > 1 ? `(+${authorCount - 1})` : ''}</p>
                <p class="card-journal">${item.journal} (${item.year})</p>
            </div>
            <div class="card-body">
                <p class="card-abstract">${item.abstract.substring(0, 150)}...</p>
                <div class="card-tags">
                    ${tagsHTML}
                    ${item.tags.length > 3 ? `<span class="card-tag">+${item.tags.length - 3}</span>` : ''}
                    <span class="card-tag ${statusClass}">${statusText}</span>
                </div>
            </div>
            <div class="card-footer">
                <div class="card-meta">
                    <span class="card-year">${item.year}</span>
                    ${item.saved ? '<span class="card-saved"><i class="fas fa-bookmark"></i> Saved</span>' : ''}
                </div>
                <div class="card-actions">
                    <button class="card-action-btn btn-view" data-id="${item.id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="card-action-btn ${item.saved ? 'btn-save saved' : 'btn-save'}" data-id="${item.id}" title="${item.saved ? 'Remove from saved' : 'Save to collection'}">
                        <i class="${item.saved ? 'fas' : 'far'} fa-bookmark"></i>
                    </button>
                    <button class="card-action-btn btn-cite" data-id="${item.id}" title="Copy Citation">
                        <i class="fas fa-quote-right"></i>
                    </button>
                    <button class="card-action-btn btn-edit" data-id="${item.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="card-action-btn btn-delete" data-id="${item.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }
    
    renderListView(data) {
        const container = document.getElementById('list-body');
        container.innerHTML = '';
        
        data.forEach(item => {
            const listItem = this.createListItemElement(item);
            container.appendChild(listItem);
        });
    }
    
    renderPagination(totalPages) {
        const pageNumbers = document.getElementById('page-numbers');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        
        // Update button states
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
        
        // Generate page numbers
        let pageNumbersHTML = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;
        
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pageNumbersHTML += `
                <button class="page-number ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        pageNumbers.innerHTML = pageNumbersHTML;
    }
    
    addEventListeners() {
        console.log('Adding event listeners...');
        
        // Search functionality
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch());
        }
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleSearch();
            });
        }
        
        const clearSearchBtn = document.getElementById('clear-search-btn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => this.clearSearch());
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-tag').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // Category filters
        document.querySelectorAll('.category-tag').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCategoryChange(e));
        });
        
        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleViewChange(e));
        });
        
        // Add literature buttons
        const addButtons = [
            'add-literature-btn',
            'add-empty-btn', 
            'quick-add-btn'
        ];
        
        addButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.openAddModal());
            }
        });
        
        // Modal controls
        const modalCloseBtn = document.getElementById('modal-close-btn');
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => this.closeModal());
        }
        
        const modalCancelBtn = document.getElementById('modal-cancel-btn');
        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        const modalSaveBtn = document.getElementById('modal-save-btn');
        if (modalSaveBtn) {
            modalSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveLiterature();
            });
        }
        
        // Form submission
        const literatureForm = document.getElementById('literature-form');
        if (literatureForm) {
            literatureForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveLiterature();
            });
        }
        
        // View modal controls
        const viewModalCloseBtn = document.getElementById('view-modal-close-btn');
        if (viewModalCloseBtn) {
            viewModalCloseBtn.addEventListener('click', () => this.closeViewModal());
        }
        
        const viewCloseBtn = document.getElementById('view-close-btn');
        if (viewCloseBtn) {
            viewCloseBtn.addEventListener('click', () => this.closeViewModal());
        }
        
        const viewEditBtn = document.getElementById('view-edit-btn');
        if (viewEditBtn) {
            viewEditBtn.addEventListener('click', () => this.editCurrentLiterature());
        }
        
        const viewCiteBtn = document.getElementById('view-cite-btn');
        if (viewCiteBtn) {
            viewCiteBtn.addEventListener('click', () => this.copyCitation());
        }
        
        // Delete modal controls
        const deleteModalCloseBtn = document.getElementById('delete-modal-close-btn');
        if (deleteModalCloseBtn) {
            deleteModalCloseBtn.addEventListener('click', () => this.closeDeleteModal());
        }
        
        const deleteCancelBtn = document.getElementById('delete-cancel-btn');
        if (deleteCancelBtn) {
            deleteCancelBtn.addEventListener('click', () => this.closeDeleteModal());
        }
        
        const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
        if (deleteConfirmBtn) {
            deleteConfirmBtn.addEventListener('click', () => this.confirmDelete());
        }
        
        // Pagination
        const prevPageBtn = document.getElementById('prev-page');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        
        const nextPageBtn = document.getElementById('next-page');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modal.id === 'literature-modal') this.closeModal();
                    if (modal.id === 'view-modal') this.closeViewModal();
                    if (modal.id === 'delete-modal') this.closeDeleteModal();
                    if (modal.id === 'import-export-modal') this.closeImportExportModal();
                }
            });
        });
    }
    
    delegateEvents() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // View button
            if (target.closest('.btn-view')) {
                const btn = target.closest('.btn-view');
                const id = parseInt(btn.dataset.id);
                console.log('View button clicked for id:', id);
                this.viewLiterature(id);
            }
            
            // Save button
            else if (target.closest('.btn-save')) {
                const btn = target.closest('.btn-save');
                const id = parseInt(btn.dataset.id);
                console.log('Save button clicked for id:', id);
                this.toggleSave(id);
            }
            
            // Cite button
            else if (target.closest('.btn-cite')) {
                const btn = target.closest('.btn-cite');
                const id = parseInt(btn.dataset.id);
                console.log('Cite button clicked for id:', id);
                const item = this.literatureData.find(i => i.id === id);
                if (item) {
                    const citation = this.generateCitation(item);
                    navigator.clipboard.writeText(citation.replace(/<[^>]*>/g, ''))
                        .then(() => {
                            this.showNotification('Citation copied to clipboard!');
                        })
                        .catch(err => {
                            console.error('Failed to copy:', err);
                            this.showNotification('Failed to copy citation', 'error');
                        });
                }
            }
            
            // Edit button
            else if (target.closest('.btn-edit')) {
                const btn = target.closest('.btn-edit');
                const id = parseInt(btn.dataset.id);
                console.log('Edit button clicked for id:', id);
                this.openAddModal(id);
            }
            
            // Delete button
            else if (target.closest('.btn-delete')) {
                const btn = target.closest('.btn-delete');
                const id = parseInt(btn.dataset.id);
                console.log('Delete button clicked for id:', id);
                this.promptDelete(id);
            }
            
            // Page number buttons
            else if (target.closest('.page-number')) {
                const btn = target.closest('.page-number');
                const page = parseInt(btn.dataset.page);
                console.log('Page button clicked:', page);
                this.goToPage(page);
            }
        });
    }
    
    handleSearch() {
        const searchInput = document.getElementById('search-input');
        this.currentSearch = searchInput.value.trim();
        this.currentPage = 1;
        
        // Show/hide clear button
        const clearBtn = document.getElementById('clear-search-btn');
        if (clearBtn) {
            clearBtn.style.display = this.currentSearch ? 'block' : 'none';
        }
        
        this.render();
    }
    
    clearSearch() {
        document.getElementById('search-input').value = '';
        this.currentSearch = '';
        document.getElementById('clear-search-btn').style.display = 'none';
        this.currentPage = 1;
        this.render();
    }
    
    handleFilterChange(e) {
        // Update active filter button
        document.querySelectorAll('.filter-tag').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
        
        this.currentFilter = e.target.dataset.filter;
        this.currentPage = 1;
        this.render();
    }
    
    handleCategoryChange(e) {
        // Toggle category filter
        if (this.currentCategory === e.target.dataset.category) {
            this.currentCategory = null;
            e.target.classList.remove('active');
        } else {
            document.querySelectorAll('.category-tag').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            this.currentCategory = e.target.dataset.category;
        }
        
        this.currentPage = 1;
        this.render();
    }
    
    handleViewChange(e) {
        const view = e.target.closest('.view-btn').dataset.view;
        
        // Update active view button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.closest('.view-btn').classList.add('active');
        
        this.currentView = view;
        this.render();
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.render();
    }
    
    openAddModal(itemId = null) {
        console.log('Opening add modal, itemId:', itemId);
        const modal = document.getElementById('literature-modal');
        const title = document.getElementById('modal-title');
        const form = document.getElementById('literature-form');
        
        if (itemId) {
            // Edit mode
            title.textContent = 'Edit Literature';
            this.editingId = itemId;
            
            const item = this.literatureData.find(i => i.id === itemId);
            if (item) {
                document.getElementById('literature-id').value = item.id;
                document.getElementById('literature-title').value = item.title;
                document.getElementById('literature-authors').value = item.authors;
                document.getElementById('literature-year').value = item.year;
                document.getElementById('literature-journal').value = item.journal;
                document.getElementById('literature-volume').value = item.volume || '';
                document.getElementById('literature-pages').value = item.pages || '';
                document.getElementById('literature-abstract').value = item.abstract;
                document.getElementById('literature-tags').value = item.tags.join(', ');
                document.getElementById('literature-status').value = item.status;
                document.getElementById('literature-priority').value = item.priority || 'medium';
                document.getElementById('literature-doi').value = item.doi || '';
                document.getElementById('literature-url').value = item.url || '';
                document.getElementById('literature-notes').value = item.notes || '';
            }
        } else {
            // Add mode
            title.textContent = 'Add New Literature';
            this.editingId = null;
            if (form) form.reset();
            document.getElementById('literature-id').value = '';
            document.getElementById('literature-year').value = new Date().getFullYear();
            document.getElementById('literature-status').value = 'reviewed';
            document.getElementById('literature-priority').value = 'medium';
        }
        
        if (modal) {
            modal.style.display = 'flex';
            document.getElementById('literature-title')?.focus();
        }
    }
    
    closeModal() {
        const modal = document.getElementById('literature-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        const form = document.getElementById('literature-form');
        if (form) {
            form.reset();
        }
        this.editingId = null;
    }
    
    saveLiterature() {
        console.log('Saving literature...');
        
        // Get form values
        const id = document.getElementById('literature-id').value;
        const title = document.getElementById('literature-title').value.trim();
        const authors = document.getElementById('literature-authors').value.trim();
        const year = parseInt(document.getElementById('literature-year').value);
        const journal = document.getElementById('literature-journal').value.trim();
        const volume = document.getElementById('literature-volume').value.trim();
        const pages = document.getElementById('literature-pages').value.trim();
        const abstract = document.getElementById('literature-abstract').value.trim();
        const tags = document.getElementById('literature-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const status = document.getElementById('literature-status').value;
        const priority = document.getElementById('literature-priority').value;
        const doi = document.getElementById('literature-doi').value.trim();
        const url = document.getElementById('literature-url').value.trim();
        const notes = document.getElementById('literature-notes').value.trim();
        
        // Validate required fields
        if (!title || !authors || !journal || !abstract || tags.length === 0) {
            alert('Please fill in all required fields (marked with *)');
            return;
        }
        
        // Create literature object
        const literature = {
            title,
            authors,
            year,
            journal,
            volume: volume || undefined,
            pages: pages || undefined,
            abstract,
            tags,
            status,
            priority,
            doi: doi || undefined,
            url: url || undefined,
            notes: notes || undefined,
            saved: false,
            addedDate: new Date().toISOString().split('T')[0]
        };
        
        if (id) {
            // Update existing item
            const index = this.literatureData.findIndex(item => item.id === parseInt(id));
            if (index !== -1) {
                // Preserve saved status
                literature.saved = this.literatureData[index].saved;
                literature.id = parseInt(id);
                this.literatureData[index] = literature;
                console.log('Updated item:', literature);
            }
        } else {
            // Add new item
            const newId = this.literatureData.length > 0 
                ? Math.max(...this.literatureData.map(item => item.id)) + 1 
                : 1;
            literature.id = newId;
            this.literatureData.push(literature);
            console.log('Added new item:', literature);
        }
        
        // Save to storage and re-render
        this.saveToStorage();
        this.closeModal();
        this.render();
        
        // Show success message
        this.showNotification(`${id ? 'Updated' : 'Added'} literature successfully!`);
    }
    
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4caf50;
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 3000;
                    animation: slideIn 0.3s ease;
                    max-width: 400px;
                }
                .notification.error {
                    background: #f44336;
                }
                .notification.fade-out {
                    animation: fadeOut 0.3s ease forwards;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    to { opacity: 0; transform: translateX(100%); }
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    viewLiterature(id) {
        console.log('Viewing literature id:', id);
        const item = this.literatureData.find(i => i.id === id);
        if (!item) {
            console.error('Item not found:', id);
            return;
        }
        
        const modal = document.getElementById('view-modal');
        const content = document.getElementById('view-content');
        
        // Format authors list
        const authorsList = item.authors.split(';').map(author => 
            `<li>${author.trim()}</li>`
        ).join('');
        
        // Format tags
        const tagsHTML = item.tags.map(tag => 
            `<span class="view-tag">${tag}</span>`
        ).join('');
        
        // Create citation
        const citation = this.generateCitation(item);
        
        content.innerHTML = `
            <div class="view-field">
                <label>Title</label>
                <p>${item.title}</p>
            </div>
            <div class="view-field">
                <label>Authors</label>
                <ul style="margin-left: 20px; margin-top: 5px;">${authorsList}</ul>
            </div>
            <div class="view-field">
                <label>Publication Details</label>
                <p>
                    <strong>Journal:</strong> ${item.journal}<br>
                    <strong>Year:</strong> ${item.year}<br>
                    ${item.volume ? `<strong>Volume:</strong> ${item.volume}<br>` : ''}
                    ${item.pages ? `<strong>Pages:</strong> ${item.pages}<br>` : ''}
                    ${item.doi ? `<strong>DOI:</strong> ${item.doi}<br>` : ''}
                </p>
            </div>
            <div class="view-field">
                <label>Status & Priority</label>
                <p>
                    <strong>Status:</strong> <span class="status-badge status-${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span><br>
                    <strong>Priority:</strong> ${item.priority ? item.priority.charAt(0).toUpperCase() + item.priority.slice(1) : 'Medium'}
                </p>
            </div>
            <div class="view-field">
                <label>Abstract</label>
                <p>${item.abstract}</p>
            </div>
            <div class="view-field">
                <label>Tags</label>
                <div class="view-tags">${tagsHTML}</div>
            </div>
            <div class="view-field">
                <label>Citation</label>
                <p style="font-style: italic; background: #f8f9fa; padding: 10px; border-radius: 5px;">
                    ${citation}
                </p>
            </div>
            ${item.notes ? `
            <div class="view-field">
                <label>Personal Notes</label>
                <p style="background: #fff8e1; padding: 10px; border-radius: 5px; border-left: 4px solid #ff9800;">
                    ${item.notes}
                </p>
            </div>
            ` : ''}
            <div class="view-field">
                <label>Additional Information</label>
                <p>
                    ${item.url ? `<strong>URL:</strong> <a href="${item.url}" target="_blank">${item.url}</a><br>` : ''}
                    <strong>Added:</strong> ${item.addedDate || 'Unknown'}<br>
                    <strong>Saved:</strong> ${item.saved ? 'Yes' : 'No'}
                </p>
            </div>
        `;
        
        // Store current item ID for edit button
        this.viewingId = id;
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    closeViewModal() {
        const modal = document.getElementById('view-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.viewingId = null;
    }
    
    editCurrentLiterature() {
        if (this.viewingId) {
            this.closeViewModal();
            this.openAddModal(this.viewingId);
        }
    }
    
    generateCitation(item) {
        // Format authors
        const authors = item.authors.split(';');
        let authorString;
        
        if (authors.length === 1) {
            authorString = authors[0].trim();
        } else if (authors.length === 2) {
            authorString = `${authors[0].trim()} and ${authors[1].trim()}`;
        } else {
            authorString = `${authors[0].trim()} et al.`;
        }
        
        // Build citation
        let citation = `${authorString} (${item.year}). ${item.title}. `;
        citation += `<em>${item.journal}</em>`;
        
        if (item.volume) {
            citation += `, ${item.volume}`;
            if (item.pages) {
                citation += `, ${item.pages}`;
            }
        } else if (item.pages) {
            citation += `, ${item.pages}`;
        }
        
        citation += '.';
        
        if (item.doi) {
            citation += ` https://doi.org/${item.doi}`;
        }
        
        return citation;
    }
    
    copyCitation() {
        if (!this.viewingId) return;
        
        const item = this.literatureData.find(i => i.id === this.viewingId);
        if (!item) return;
        
        const citation = this.generateCitation(item);
        
        // Copy to clipboard
        navigator.clipboard.writeText(citation.replace(/<[^>]*>/g, ''))
            .then(() => {
                this.showNotification('Citation copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy citation:', err);
                this.showNotification('Failed to copy citation', 'error');
            });
    }
    
    toggleSave(id) {
        const item = this.literatureData.find(i => i.id === id);
        if (item) {
            item.saved = !item.saved;
            this.saveToStorage();
            this.render();
            
            this.showNotification(
                item.saved ? 'Added to saved collection!' : 'Removed from saved collection',
                'success'
            );
        }
    }
    
    promptDelete(id) {
        const item = this.literatureData.find(i => i.id === id);
        if (!item) return;
        
        this.deletingId = id;
        const modal = document.getElementById('delete-modal');
        const preview = document.getElementById('delete-preview');
        
        preview.innerHTML = `
            <strong>${item.title}</strong><br>
            <small>${item.authors.split(';')[0]} (${item.year})</small>
        `;
        
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    confirmDelete() {
        if (!this.deletingId) return;
        
        const index = this.literatureData.findIndex(item => item.id === this.deletingId);
        if (index !== -1) {
            this.literatureData.splice(index, 1);
            this.saveToStorage();
            this.render();
            
            this.showNotification('Literature deleted successfully!');
        }
        
        this.closeDeleteModal();
    }
    
    closeDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.deletingId = null;
    }
    
    closeImportExportModal() {
        const modal = document.getElementById('import-export-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    const app = new LiteratureManager();
    app.initialize();
    
    // Make app available globally for debugging
    window.literatureApp = app;
    console.log('App initialized and available as window.literatureApp');
});
