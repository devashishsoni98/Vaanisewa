// Admin Dashboard System
class AdminDashboard {
    constructor(authSystem) {
        this.auth = authSystem;
        this.currentView = 'overview';
        this.charts = {};
        this.init();
    }

    init() {
        this.createAdminInterface();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    createAdminInterface() {
        const adminHTML = `
            <div id="adminDashboard" class="admin-dashboard screen">
                <div class="admin-header">
                    <h1>VaaniSewa Admin Dashboard</h1>
                    <div class="admin-user-info">
                        <span id="adminUserName">${this.auth.currentUser?.username || 'Admin'}</span>
                        <span class="role-badge role-${this.auth.currentUser?.role}">${this.auth.currentUser?.role || 'admin'}</span>
                    </div>
                </div>

                <nav class="admin-nav">
                    <button class="nav-btn active" data-view="overview">
                        <i class="fas fa-chart-line"></i> Overview
                    </button>
                    <button class="nav-btn" data-view="users">
                        <i class="fas fa-users"></i> User Management
                    </button>
                    <button class="nav-btn" data-view="system">
                        <i class="fas fa-cogs"></i> System Settings
                    </button>
                    <button class="nav-btn" data-view="activities">
                        <i class="fas fa-history"></i> Activity Logs
                    </button>
                    <button class="nav-btn" data-view="analytics">
                        <i class="fas fa-chart-bar"></i> Analytics
                    </button>
                </nav>

                <main class="admin-content">
                    <!-- Overview Panel -->
                    <div id="overviewPanel" class="admin-panel active">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="totalUsers">0</h3>
                                    <p>Total Users</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-user-check"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="activeUsers">0</h3>
                                    <p>Active Users</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-microphone"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="voiceCommands">0</h3>
                                    <p>Voice Commands Today</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">
                                    <i class="fas fa-server"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="systemHealth">Good</h3>
                                    <p>System Health</p>
                                </div>
                            </div>
                        </div>

                        <div class="charts-grid">
                            <div class="chart-container">
                                <h3>User Registration Trend</h3>
                                <canvas id="registrationChart"></canvas>
                            </div>
                            <div class="chart-container">
                                <h3>Voice Command Usage</h3>
                                <canvas id="commandsChart"></canvas>
                            </div>
                        </div>

                        <div class="recent-activities">
                            <h3>Recent Activities</h3>
                            <div id="recentActivitiesList" class="activities-list"></div>
                        </div>
                    </div>

                    <!-- User Management Panel -->
                    <div id="usersPanel" class="admin-panel">
                        <div class="panel-header">
                            <h2>User Management</h2>
                            <div class="panel-actions">
                                <button id="addUserBtn" class="btn btn-primary">
                                    <i class="fas fa-plus"></i> Add User
                                </button>
                                <button id="importUsersBtn" class="btn btn-secondary">
                                    <i class="fas fa-upload"></i> Import CSV
                                </button>
                                <button id="exportUsersBtn" class="btn btn-secondary">
                                    <i class="fas fa-download"></i> Export CSV
                                </button>
                            </div>
                        </div>

                        <div class="search-filters">
                            <input type="text" id="userSearch" placeholder="Search users..." class="search-input">
                            <select id="roleFilter" class="filter-select">
                                <option value="">All Roles</option>
                                <option value="student">Student</option>
                                <option value="institution_admin">Institution Admin</option>
                                <option value="admin">Admin</option>
                            </select>
                            <select id="statusFilter" class="filter-select">
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div class="users-table-container">
                            <table id="usersTable" class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Last Login</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="usersTableBody">
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- System Settings Panel -->
                    <div id="systemPanel" class="admin-panel">
                        <div class="panel-header">
                            <h2>System Settings</h2>
                        </div>

                        <div class="settings-sections">
                            <div class="settings-section">
                                <h3>General Settings</h3>
                                <div class="setting-item">
                                    <label for="systemName">System Name:</label>
                                    <input type="text" id="systemName" value="VaaniSewa" class="setting-input">
                                </div>
                                <div class="setting-item">
                                    <label for="defaultLanguage">Default Language:</label>
                                    <select id="defaultLanguage" class="setting-select">
                                        <option value="en">English</option>
                                        <option value="hi">Hindi</option>
                                    </select>
                                </div>
                                <div class="setting-item">
                                    <label for="sessionTimeout">Session Timeout (minutes):</label>
                                    <input type="number" id="sessionTimeout" value="30" min="5" max="480" class="setting-input">
                                </div>
                            </div>

                            <div class="settings-section">
                                <h3>Voice Settings</h3>
                                <div class="setting-item">
                                    <label for="defaultSpeechRate">Default Speech Rate:</label>
                                    <input type="range" id="defaultSpeechRate" min="0.5" max="2" step="0.1" value="1" class="setting-range">
                                    <span id="speechRateDisplay">1.0</span>
                                </div>
                                <div class="setting-item">
                                    <label for="voiceRecognitionTimeout">Voice Recognition Timeout (seconds):</label>
                                    <input type="number" id="voiceRecognitionTimeout" value="10" min="5" max="60" class="setting-input">
                                </div>
                            </div>

                            <div class="settings-section">
                                <h3>Security Settings</h3>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="requireStrongPasswords" checked>
                                        Require Strong Passwords
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label>
                                        <input type="checkbox" id="enableActivityLogging" checked>
                                        Enable Activity Logging
                                    </label>
                                </div>
                                <div class="setting-item">
                                    <label for="maxLoginAttempts">Max Login Attempts:</label>
                                    <input type="number" id="maxLoginAttempts" value="5" min="3" max="10" class="setting-input">
                                </div>
                            </div>
                        </div>

                        <div class="settings-actions">
                            <button id="saveSettingsBtn" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Settings
                            </button>
                            <button id="resetSettingsBtn" class="btn btn-secondary">
                                <i class="fas fa-undo"></i> Reset to Defaults
                            </button>
                            <button id="backupDataBtn" class="btn btn-success">
                                <i class="fas fa-database"></i> Backup Data
                            </button>
                            <button id="restoreDataBtn" class="btn btn-warning">
                                <i class="fas fa-upload"></i> Restore Data
                            </button>
                        </div>
                    </div>

                    <!-- Activity Logs Panel -->
                    <div id="activitiesPanel" class="admin-panel">
                        <div class="panel-header">
                            <h2>Activity Logs</h2>
                            <div class="panel-actions">
                                <button id="clearLogsBtn" class="btn btn-danger">
                                    <i class="fas fa-trash"></i> Clear Logs
                                </button>
                                <button id="exportLogsBtn" class="btn btn-secondary">
                                    <i class="fas fa-download"></i> Export Logs
                                </button>
                            </div>
                        </div>

                        <div class="logs-filters">
                            <input type="text" id="logsSearch" placeholder="Search activities..." class="search-input">
                            <select id="actionFilter" class="filter-select">
                                <option value="">All Actions</option>
                                <option value="login">Login</option>
                                <option value="logout">Logout</option>
                                <option value="voice_command">Voice Command</option>
                                <option value="user_created">User Created</option>
                                <option value="user_updated">User Updated</option>
                                <option value="user_deleted">User Deleted</option>
                            </select>
                            <input type="date" id="dateFilter" class="filter-input">
                        </div>

                        <div class="logs-container">
                            <div id="activitiesLog" class="activities-log"></div>
                        </div>
                    </div>

                    <!-- Analytics Panel -->
                    <div id="analyticsPanel" class="admin-panel">
                        <div class="panel-header">
                            <h2>Analytics & Reports</h2>
                        </div>

                        <div class="analytics-grid">
                            <div class="analytics-card">
                                <h3>Voice Command Statistics</h3>
                                <canvas id="voiceStatsChart"></canvas>
                            </div>
                            <div class="analytics-card">
                                <h3>User Engagement</h3>
                                <canvas id="engagementChart"></canvas>
                            </div>
                            <div class="analytics-card">
                                <h3>System Performance</h3>
                                <div id="performanceMetrics" class="metrics-list"></div>
                            </div>
                            <div class="analytics-card">
                                <h3>Accessibility Features Usage</h3>
                                <canvas id="accessibilityChart"></canvas>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <!-- User Modal -->
            <div id="userModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="userModalTitle">Add User</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form id="userForm" class="modal-form">
                        <div class="form-group">
                            <label for="modalUsername">Username:</label>
                            <input type="text" id="modalUsername" required class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="modalEmail">Email:</label>
                            <input type="email" id="modalEmail" required class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="modalRole">Role:</label>
                            <select id="modalRole" required class="form-select">
                                <option value="student">Student</option>
                                <option value="institution_admin">Institution Admin</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="modalDisability">Disability Type:</label>
                            <select id="modalDisability" class="form-select">
                                <option value="visual">Visual Impairment</option>
                                <option value="hearing">Hearing Impairment</option>
                                <option value="mobility">Mobility Impairment</option>
                                <option value="cognitive">Cognitive Impairment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="modalIsActive" checked>
                                Active User
                            </label>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn btn-primary">Save User</button>
                            <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Confirmation Modal -->
            <div id="confirmModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="confirmTitle">Confirm Action</h3>
                    </div>
                    <div class="modal-body">
                        <p id="confirmMessage">Are you sure you want to perform this action?</p>
                    </div>
                    <div class="modal-actions">
                        <button id="confirmYes" class="btn btn-danger">Yes</button>
                        <button id="confirmNo" class="btn btn-secondary">No</button>
                    </div>
                </div>
            </div>
        `;

        // Insert admin dashboard into main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertAdjacentHTML('beforeend', adminHTML);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.nav-btn').dataset.view;
                this.switchView(view);
            });
        });

        // User management
        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            this.showUserModal();
        });

        document.getElementById('importUsersBtn')?.addEventListener('click', () => {
            this.importUsers();
        });

        document.getElementById('exportUsersBtn')?.addEventListener('click', () => {
            this.exportUsers();
        });

        // Search and filters
        document.getElementById('userSearch')?.addEventListener('input', () => {
            this.filterUsers();
        });

        document.getElementById('roleFilter')?.addEventListener('change', () => {
            this.filterUsers();
        });

        document.getElementById('statusFilter')?.addEventListener('change', () => {
            this.filterUsers();
        });

        // Settings
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('backupDataBtn')?.addEventListener('click', () => {
            this.backupData();
        });

        document.getElementById('restoreDataBtn')?.addEventListener('click', () => {
            this.restoreData();
        });

        // Modal events
        document.getElementById('userForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        // Activity tracking
        document.addEventListener('click', () => {
            this.auth.updateLastActivity();
        });
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.admin-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${view}Panel`).classList.add('active');

        this.currentView = view;
        this.loadViewData(view);
    }

    loadViewData(view) {
        switch (view) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'users':
                this.loadUsersData();
                break;
            case 'activities':
                this.loadActivitiesData();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
        }
    }

    loadDashboardData() {
        this.loadOverviewData();
    }

    loadOverviewData() {
        const users = this.auth.getUsers();
        const activities = this.auth.getActivities();
        
        // Update stats
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('activeUsers').textContent = users.filter(u => u.isActive).length;
        
        // Count voice commands today
        const today = new Date().toDateString();
        const todayCommands = activities.filter(a => 
            a.action === 'voice_command' && 
            new Date(a.timestamp).toDateString() === today
        ).length;
        document.getElementById('voiceCommands').textContent = todayCommands;

        // Load recent activities
        this.loadRecentActivities();
        
        // Load charts
        this.loadCharts();
    }

    loadRecentActivities() {
        const activities = this.auth.getActivities(10);
        const container = document.getElementById('recentActivitiesList');
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${this.getActivityIcon(activity.action)}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-action">${this.formatActivityAction(activity.action)}</div>
                    <div class="activity-meta">
                        ${activity.username} • ${this.formatDate(activity.timestamp)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadUsersData() {
        const users = this.auth.getUsers();
        const tbody = document.getElementById('usersTableBody');
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${this.formatDate(user.lastLogin)}</td>
                <td class="actions">
                    <button class="btn-icon" onclick="adminDashboard.editUser('${user.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="adminDashboard.deleteUser('${user.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    loadActivitiesData() {
        const activities = this.auth.getActivities();
        const container = document.getElementById('activitiesLog');
        
        container.innerHTML = activities.map(activity => `
            <div class="log-entry">
                <div class="log-timestamp">${this.formatDateTime(activity.timestamp)}</div>
                <div class="log-user">${activity.username}</div>
                <div class="log-action">${this.formatActivityAction(activity.action)}</div>
                <div class="log-details">${JSON.stringify(activity.data)}</div>
            </div>
        `).join('');
    }

    loadAnalyticsData() {
        // Load performance metrics
        const performanceContainer = document.getElementById('performanceMetrics');
        const metrics = this.getPerformanceMetrics();
        
        performanceContainer.innerHTML = Object.entries(metrics).map(([key, value]) => `
            <div class="metric-item">
                <span class="metric-label">${key}:</span>
                <span class="metric-value">${value}</span>
            </div>
        `).join('');
    }

    loadCharts() {
        // This would integrate with Chart.js or similar library
        // For now, we'll create simple mock charts
        this.createMockChart('registrationChart');
        this.createMockChart('commandsChart');
    }

    createMockChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#667eea';
        ctx.fillRect(10, 10, 100, 50);
        ctx.fillStyle = '#764ba2';
        ctx.fillRect(120, 30, 80, 30);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(210, 20, 60, 40);
    }

    showUserModal(userId = null) {
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');
        
        if (userId) {
            const user = this.auth.getUsers().find(u => u.id === userId);
            title.textContent = 'Edit User';
            this.populateUserForm(user);
        } else {
            title.textContent = 'Add User';
            form.reset();
        }
        
        modal.style.display = 'block';
    }

    populateUserForm(user) {
        document.getElementById('modalUsername').value = user.username;
        document.getElementById('modalEmail').value = user.email;
        document.getElementById('modalRole').value = user.role;
        document.getElementById('modalDisability').value = user.disability;
        document.getElementById('modalIsActive').checked = user.isActive;
    }

    saveUser() {
        const formData = new FormData(document.getElementById('userForm'));
        const userData = {
            id: Date.now().toString(),
            username: formData.get('username'),
            email: formData.get('email'),
            role: formData.get('role'),
            disability: formData.get('disability'),
            isActive: formData.has('isActive'),
            createdAt: new Date().toISOString(),
            lastLogin: null
        };

        const users = this.auth.getUsers();
        users.push(userData);
        localStorage.setItem('vaanisewa-users', JSON.stringify(users));
        
        this.auth.logActivity('user_created', { userId: userData.id, username: userData.username });
        this.closeModals();
        this.loadUsersData();
    }

    editUser(userId) {
        this.showUserModal(userId);
    }

    deleteUser(userId) {
        this.showConfirmation(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            () => {
                this.auth.deleteUser(userId);
                this.loadUsersData();
            }
        );
    }

    showConfirmation(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        document.getElementById('confirmYes').onclick = () => {
            onConfirm();
            this.closeModals();
        };
        
        modal.style.display = 'block';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    filterUsers() {
        const search = document.getElementById('userSearch').value.toLowerCase();
        const roleFilter = document.getElementById('roleFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        const users = this.auth.getUsers().filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(search) || 
                                user.email.toLowerCase().includes(search);
            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesStatus = !statusFilter || 
                               (statusFilter === 'active' && user.isActive) ||
                               (statusFilter === 'inactive' && !user.isActive);
            
            return matchesSearch && matchesRole && matchesStatus;
        });
        
        this.renderFilteredUsers(users);
    }

    renderFilteredUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="role-badge role-${user.role}">${user.role}</span></td>
                <td><span class="status-badge ${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${this.formatDate(user.lastLogin)}</td>
                <td class="actions">
                    <button class="btn-icon" onclick="adminDashboard.editUser('${user.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="adminDashboard.deleteUser('${user.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    exportUsers() {
        const users = this.auth.getUsers();
        const csv = this.convertToCSV(users);
        this.downloadCSV(csv, 'vaanisewa-users.csv');
    }

    importUsers() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.parseCSV(file);
            }
        };
        input.click();
    }

    convertToCSV(data) {
        const headers = ['Username', 'Email', 'Role', 'Disability', 'Status', 'Created At', 'Last Login'];
        const rows = data.map(user => [
            user.username,
            user.email,
            user.role,
            user.disability,
            user.isActive ? 'Active' : 'Inactive',
            user.createdAt,
            user.lastLogin || 'Never'
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',');
            
            const users = lines.slice(1).map(line => {
                const values = line.split(',');
                return {
                    id: Date.now().toString() + Math.random(),
                    username: values[0],
                    email: values[1],
                    role: values[2],
                    disability: values[3],
                    isActive: values[4] === 'Active',
                    createdAt: new Date().toISOString(),
                    lastLogin: null
                };
            }).filter(user => user.username); // Filter out empty rows
            
            const existingUsers = this.auth.getUsers();
            const allUsers = [...existingUsers, ...users];
            localStorage.setItem('vaanisewa-users', JSON.stringify(allUsers));
            
            this.loadUsersData();
            this.auth.logActivity('users_imported', { count: users.length });
        };
        reader.readAsText(file);
    }

    saveSettings() {
        const settings = {
            systemName: document.getElementById('systemName').value,
            defaultLanguage: document.getElementById('defaultLanguage').value,
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            defaultSpeechRate: parseFloat(document.getElementById('defaultSpeechRate').value),
            voiceRecognitionTimeout: parseInt(document.getElementById('voiceRecognitionTimeout').value),
            requireStrongPasswords: document.getElementById('requireStrongPasswords').checked,
            enableActivityLogging: document.getElementById('enableActivityLogging').checked,
            maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value)
        };
        
        localStorage.setItem('vaanisewa-settings', JSON.stringify(settings));
        this.auth.logActivity('settings_updated', settings);
        
        // Show success message
        this.showNotification('Settings saved successfully!', 'success');
    }

    backupData() {
        const data = {
            users: this.auth.getUsers(),
            activities: this.auth.getActivities(),
            settings: JSON.parse(localStorage.getItem('vaanisewa-settings') || '{}'),
            timestamp: new Date().toISOString()
        };
        
        const backup = JSON.stringify(data, null, 2);
        const blob = new Blob([backup], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vaanisewa-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.auth.logActivity('data_backup', { timestamp: data.timestamp });
    }

    restoreData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (data.users) localStorage.setItem('vaanisewa-users', JSON.stringify(data.users));
                        if (data.activities) localStorage.setItem('vaanisewa-activities', JSON.stringify(data.activities));
                        if (data.settings) localStorage.setItem('vaanisewa-settings', JSON.stringify(data.settings));
                        
                        this.auth.logActivity('data_restored', { timestamp: data.timestamp });
                        this.showNotification('Data restored successfully!', 'success');
                        this.loadDashboardData();
                    } catch (error) {
                        this.showNotification('Error restoring data: Invalid file format', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    getPerformanceMetrics() {
        return {
            'Memory Usage': `${Math.round(Math.random() * 100)}%`,
            'CPU Usage': `${Math.round(Math.random() * 50)}%`,
            'Storage Used': `${Math.round(Math.random() * 1000)}MB`,
            'Response Time': `${Math.round(Math.random() * 200)}ms`,
            'Uptime': '99.9%'
        };
    }

    getActivityIcon(action) {
        const icons = {
            'login': 'fa-sign-in-alt',
            'logout': 'fa-sign-out-alt',
            'voice_command': 'fa-microphone',
            'user_created': 'fa-user-plus',
            'user_updated': 'fa-user-edit',
            'user_deleted': 'fa-user-minus',
            'settings_updated': 'fa-cogs',
            'data_backup': 'fa-database',
            'data_restored': 'fa-upload'
        };
        return icons[action] || 'fa-info-circle';
    }

    formatActivityAction(action) {
        const actions = {
            'login': 'User Login',
            'logout': 'User Logout',
            'voice_command': 'Voice Command',
            'user_created': 'User Created',
            'user_updated': 'User Updated',
            'user_deleted': 'User Deleted',
            'settings_updated': 'Settings Updated',
            'data_backup': 'Data Backup',
            'data_restored': 'Data Restored'
        };
        return actions[action] || action;
    }

    formatDate(dateString) {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Export for global use
window.AdminDashboard = AdminDashboard;