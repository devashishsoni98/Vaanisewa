// User Dashboard System
class UserDashboard {
    constructor(authSystem) {
        this.auth = authSystem;
        this.currentView = 'profile';
        this.init();
    }

    init() {
        this.createUserInterface();
        this.setupEventListeners();
        this.loadUserData();
    }

    createUserInterface() {
        const userHTML = `
            <div id="userDashboard" class="user-dashboard screen">
                <div class="user-header">
                    <div class="user-welcome">
                        <h1>Welcome, ${this.auth.currentUser?.username || 'User'}!</h1>
                        <p>Manage your accessibility preferences and view your activity</p>
                    </div>
                    <div class="user-avatar-section">
                        <div class="user-avatar-large">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div class="user-status">
                            <span class="status-indicator active"></span>
                            <span>Online</span>
                        </div>
                    </div>
                </div>

                <nav class="user-nav">
                    <button class="nav-btn active" data-view="profile">
                        <i class="fas fa-user"></i> Profile
                    </button>
                    <button class="nav-btn" data-view="preferences">
                        <i class="fas fa-cog"></i> Preferences
                    </button>
                    <button class="nav-btn" data-view="activity">
                        <i class="fas fa-chart-line"></i> My Activity
                    </button>
                    <button class="nav-btn" data-view="accessibility">
                        <i class="fas fa-universal-access"></i> Accessibility
                    </button>
                </nav>

                <main class="user-content">
                    <!-- Profile Panel -->
                    <div id="profilePanel" class="user-panel active">
                        <div class="panel-header">
                            <h2>Profile Information</h2>
                            <button id="editProfileBtn" class="btn btn-primary">
                                <i class="fas fa-edit"></i> Edit Profile
                            </button>
                        </div>

                        <div class="profile-grid">
                            <div class="profile-card">
                                <h3>Personal Information</h3>
                                <div class="info-item">
                                    <label>Username:</label>
                                    <span id="profileUsername">${this.auth.currentUser?.username || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Email:</label>
                                    <span id="profileEmail">${this.auth.currentUser?.email || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Role:</label>
                                    <span id="profileRole" class="role-badge role-${this.auth.currentUser?.role}">${this.auth.currentUser?.role || 'N/A'}</span>
                                </div>
                                <div class="info-item">
                                    <label>Disability Type:</label>
                                    <span id="profileDisability">${this.formatDisabilityType(this.auth.currentUser?.disability)}</span>
                                </div>
                            </div>

                            <div class="profile-card">
                                <h3>Account Statistics</h3>
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <div class="stat-number" id="userVoiceCommands">0</div>
                                        <div class="stat-label">Voice Commands</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-number" id="userSessions">0</div>
                                        <div class="stat-label">Sessions</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-number" id="userDaysActive">0</div>
                                        <div class="stat-label">Days Active</div>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-card">
                                <h3>Account Details</h3>
                                <div class="info-item">
                                    <label>Member Since:</label>
                                    <span id="profileCreated">${this.formatDate(this.auth.currentUser?.createdAt)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Last Login:</label>
                                    <span id="profileLastLogin">${this.formatDate(this.auth.currentUser?.lastLogin)}</span>
                                </div>
                                <div class="info-item">
                                    <label>Account Status:</label>
                                    <span class="status-badge ${this.auth.currentUser?.isActive ? 'active' : 'inactive'}">
                                        ${this.auth.currentUser?.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Preferences Panel -->
                    <div id="preferencesPanel" class="user-panel">
                        <div class="panel-header">
                            <h2>Voice & Display Preferences</h2>
                            <button id="savePreferencesBtn" class="btn btn-primary">
                                <i class="fas fa-save"></i> Save Preferences
                            </button>
                        </div>

                        <div class="preferences-sections">
                            <div class="pref-section">
                                <h3>Voice Settings</h3>
                                <div class="pref-item">
                                    <label for="userSpeechRate">Speech Rate:</label>
                                    <input type="range" id="userSpeechRate" min="0.5" max="2" step="0.1" value="1">
                                    <span id="userSpeechRateValue">1.0</span>
                                    <button class="test-btn" onclick="userDashboard.testVoiceSetting('rate')">Test</button>
                                </div>
                                <div class="pref-item">
                                    <label for="userSpeechPitch">Speech Pitch:</label>
                                    <input type="range" id="userSpeechPitch" min="0" max="2" step="0.1" value="1">
                                    <span id="userSpeechPitchValue">1.0</span>
                                    <button class="test-btn" onclick="userDashboard.testVoiceSetting('pitch')">Test</button>
                                </div>
                                <div class="pref-item">
                                    <label for="userVolume">Volume:</label>
                                    <input type="range" id="userVolume" min="0" max="1" step="0.1" value="0.7">
                                    <span id="userVolumeValue">70%</span>
                                    <button class="test-btn" onclick="userDashboard.testVoiceSetting('volume')">Test</button>
                                </div>
                                <div class="pref-item">
                                    <label for="userVoiceSelect">Preferred Voice:</label>
                                    <select id="userVoiceSelect">
                                        <option value="">Default Voice</option>
                                    </select>
                                    <button class="test-btn" onclick="userDashboard.testVoiceSetting('voice')">Test</button>
                                </div>
                            </div>

                            <div class="pref-section">
                                <h3>Language & Localization</h3>
                                <div class="pref-item">
                                    <label for="userLanguage">Interface Language:</label>
                                    <select id="userLanguage">
                                        <option value="en">English</option>
                                        <option value="hi">Hindi (हिंदी)</option>
                                    </select>
                                </div>
                                <div class="pref-item">
                                    <label for="userVoiceLanguage">Voice Recognition Language:</label>
                                    <select id="userVoiceLanguage">
                                        <option value="en-US">English (US)</option>
                                        <option value="hi-IN">Hindi (India)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="pref-section">
                                <h3>Display Settings</h3>
                                <div class="pref-item">
                                    <label>
                                        <input type="checkbox" id="userHighContrast">
                                        High Contrast Mode
                                    </label>
                                    <small>Improves visibility for users with visual impairments</small>
                                </div>
                                <div class="pref-item">
                                    <label>
                                        <input type="checkbox" id="userReducedMotion">
                                        Reduce Motion
                                    </label>
                                    <small>Minimizes animations and transitions</small>
                                </div>
                                <div class="pref-item">
                                    <label>
                                        <input type="checkbox" id="userLargeText">
                                        Large Text
                                    </label>
                                    <small>Increases font size throughout the interface</small>
                                </div>
                                <div class="pref-item">
                                    <label for="userFontSize">Font Size:</label>
                                    <select id="userFontSize">
                                        <option value="small">Small</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="large">Large</option>
                                        <option value="extra-large">Extra Large</option>
                                    </select>
                                </div>
                            </div>

                            <div class="pref-section">
                                <h3>Voice Command Settings</h3>
                                <div class="pref-item">
                                    <label>
                                        <input type="checkbox" id="userVoiceConfirmation" checked>
                                        Voice Confirmation
                                    </label>
                                    <small>Speak confirmation for voice commands</small>
                                </div>
                                <div class="pref-item">
                                    <label for="userCommandTimeout">Command Timeout (seconds):</label>
                                    <input type="number" id="userCommandTimeout" min="5" max="30" value="10">
                                    <small>How long to wait for voice input</small>
                                </div>
                                <div class="pref-item">
                                    <label>
                                        <input type="checkbox" id="userContinuousListening" checked>
                                        Continuous Listening
                                    </label>
                                    <small>Keep listening for commands automatically</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Activity Panel -->
                    <div id="activityPanel" class="user-panel">
                        <div class="panel-header">
                            <h2>My Activity</h2>
                            <div class="panel-actions">
                                <select id="activityPeriod" class="filter-select">
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="all">All Time</option>
                                </select>
                            </div>
                        </div>

                        <div class="activity-overview">
                            <div class="activity-stats">
                                <div class="activity-stat">
                                    <div class="stat-icon">
                                        <i class="fas fa-microphone"></i>
                                    </div>
                                    <div class="stat-info">
                                        <div class="stat-number" id="periodVoiceCommands">0</div>
                                        <div class="stat-label">Voice Commands</div>
                                    </div>
                                </div>
                                <div class="activity-stat">
                                    <div class="stat-icon">
                                        <i class="fas fa-clock"></i>
                                    </div>
                                    <div class="stat-info">
                                        <div class="stat-number" id="periodTimeSpent">0h</div>
                                        <div class="stat-label">Time Spent</div>
                                    </div>
                                </div>
                                <div class="activity-stat">
                                    <div class="stat-icon">
                                        <i class="fas fa-mouse-pointer"></i>
                                    </div>
                                    <div class="stat-info">
                                        <div class="stat-number" id="periodInteractions">0</div>
                                        <div class="stat-label">Interactions</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="activity-charts">
                            <div class="chart-container">
                                <h3>Voice Command Usage</h3>
                                <canvas id="userVoiceChart"></canvas>
                            </div>
                            <div class="chart-container">
                                <h3>Daily Activity</h3>
                                <canvas id="userActivityChart"></canvas>
                            </div>
                        </div>

                        <div class="recent-activity">
                            <h3>Recent Activity</h3>
                            <div id="userRecentActivity" class="activity-timeline"></div>
                        </div>
                    </div>

                    <!-- Accessibility Panel -->
                    <div id="accessibilityPanel" class="user-panel">
                        <div class="panel-header">
                            <h2>Accessibility Features</h2>
                        </div>

                        <div class="accessibility-sections">
                            <div class="access-section">
                                <h3>Visual Accessibility</h3>
                                <div class="feature-grid">
                                    <div class="feature-card">
                                        <div class="feature-icon">
                                            <i class="fas fa-eye"></i>
                                        </div>
                                        <div class="feature-info">
                                            <h4>High Contrast</h4>
                                            <p>Enhanced color contrast for better visibility</p>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="toggleHighContrast">
                                                <span class="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="feature-card">
                                        <div class="feature-icon">
                                            <i class="fas fa-text-height"></i>
                                        </div>
                                        <div class="feature-info">
                                            <h4>Large Text</h4>
                                            <p>Increased font size for easier reading</p>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="toggleLargeText">
                                                <span class="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="access-section">
                                <h3>Motor Accessibility</h3>
                                <div class="feature-grid">
                                    <div class="feature-card">
                                        <div class="feature-icon">
                                            <i class="fas fa-hand-pointer"></i>
                                        </div>
                                        <div class="feature-info">
                                            <h4>Reduced Motion</h4>
                                            <p>Minimize animations and transitions</p>
                                            <label class="toggle-switch">
                                                <input type="checkbox" id="toggleReducedMotion">
                                                <span class="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="feature-card">
                                        <div class="feature-icon">
                                            <i class="fas fa-keyboard"></i>
                                        </div>
                                        <div class="feature-info">
                                            <h4>Keyboard Navigation</h4>
                                            <p>Full keyboard accessibility support</p>
                                            <span class="feature-status enabled">Always Enabled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="access-section">
                                <h3>Voice Accessibility</h3>
                                <div class="feature-grid">
                                    <div class="feature-card">
                                        <div class="feature-icon">
                                            <i class="fas fa-microphone-alt"></i>
                                        </div>
                                        <div class="feature-info">
                                            <h4>Voice Commands</h4>
                                            <p>Navigate using voice commands</p>
                                            <span class="feature-status enabled">Active</span>
                                        </div>
                                    </div>
                                    <div class="feature-card">
                                        <div class="feature-icon">
                                            <i class="fas fa-volume-up"></i>
                                        </div>
                                        <div class="feature-info">
                                            <h4>Text-to-Speech</h4>
                                            <p>Audio feedback for all interactions</p>
                                            <span class="feature-status enabled">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="access-section">
                                <h3>Cognitive Accessibility</h3>
                                <div class="feature-grid">
                                    <div class="feature-card">
                                        <div class="feature-icon">
                                            <i class="fas fa-brain"></i>
                                        </div>
                                        <div class="feature-info">
                                            <h4>Simple Interface</h4>
                                            <p>Simplified navigation and clear instructions</p>
                                            <span class="feature-status enabled">Always Enabled</span>
                                        </div>
                                    </div>
                                    <div class="feature-card">
                                        <div class="feature-icon">
                                            <i class="fas fa-question-circle"></i>
                                        </div>
                                        <div class="feature-info">
                                            <h4>Help & Guidance</h4>
                                            <p>Contextual help and voice guidance</p>
                                            <span class="feature-status enabled">Available</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <!-- Edit Profile Modal -->
            <div id="editProfileModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Edit Profile</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <form id="editProfileForm" class="modal-form">
                        <div class="form-group">
                            <label for="editUsername">Username:</label>
                            <input type="text" id="editUsername" required class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="editEmail">Email:</label>
                            <input type="email" id="editEmail" required class="form-input">
                        </div>
                        <div class="form-group">
                            <label for="editDisability">Disability Type:</label>
                            <select id="editDisability" class="form-select">
                                <option value="visual">Visual Impairment</option>
                                <option value="hearing">Hearing Impairment</option>
                                <option value="mobility">Mobility Impairment</option>
                                <option value="cognitive">Cognitive Impairment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Insert user dashboard into main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertAdjacentHTML('beforeend', userHTML);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.user-nav .nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.nav-btn').dataset.view;
                this.switchView(view);
            });
        });

        // Profile editing
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            this.showEditProfileModal();
        });

        document.getElementById('editProfileForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Preferences
        document.getElementById('savePreferencesBtn')?.addEventListener('click', () => {
            this.savePreferences();
        });

        // Preference controls
        document.getElementById('userSpeechRate')?.addEventListener('input', (e) => {
            document.getElementById('userSpeechRateValue').textContent = parseFloat(e.target.value).toFixed(1);
        });

        document.getElementById('userSpeechPitch')?.addEventListener('input', (e) => {
            document.getElementById('userSpeechPitchValue').textContent = parseFloat(e.target.value).toFixed(1);
        });

        document.getElementById('userVolume')?.addEventListener('input', (e) => {
            document.getElementById('userVolumeValue').textContent = Math.round(e.target.value * 100) + '%';
        });

        // Activity period filter
        document.getElementById('activityPeriod')?.addEventListener('change', () => {
            this.loadActivityData();
        });

        // Accessibility toggles
        document.getElementById('toggleHighContrast')?.addEventListener('change', (e) => {
            this.toggleAccessibilityFeature('highContrast', e.target.checked);
        });

        document.getElementById('toggleLargeText')?.addEventListener('change', (e) => {
            this.toggleAccessibilityFeature('largeText', e.target.checked);
        });

        document.getElementById('toggleReducedMotion')?.addEventListener('change', (e) => {
            this.toggleAccessibilityFeature('reducedMotion', e.target.checked);
        });

        // Modal events
        document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });
    }

    switchView(view) {
        // Update navigation
        document.querySelectorAll('.user-nav .nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Update panels
        document.querySelectorAll('.user-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${view}Panel`).classList.add('active');

        this.currentView = view;
        this.loadViewData(view);
    }

    loadViewData(view) {
        switch (view) {
            case 'profile':
                this.loadProfileData();
                break;
            case 'preferences':
                this.loadPreferencesData();
                break;
            case 'activity':
                this.loadActivityData();
                break;
            case 'accessibility':
                this.loadAccessibilityData();
                break;
        }
    }

    loadUserData() {
        this.loadProfileData();
        this.loadPreferencesData();
    }

    loadProfileData() {
        if (!this.auth.currentUser) return;

        const user = this.auth.currentUser;
        const activities = this.auth.getActivities().filter(a => a.userId === user.id);

        // Update profile information
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileRole').textContent = user.role;
        document.getElementById('profileRole').className = `role-badge role-${user.role}`;
        document.getElementById('profileDisability').textContent = this.formatDisabilityType(user.disability);
        document.getElementById('profileCreated').textContent = this.formatDate(user.createdAt);
        document.getElementById('profileLastLogin').textContent = this.formatDate(user.lastLogin);

        // Calculate statistics
        const voiceCommands = activities.filter(a => a.action === 'voice_command').length;
        const sessions = activities.filter(a => a.action === 'login').length;
        const activeDays = new Set(activities.map(a => new Date(a.timestamp).toDateString())).size;

        document.getElementById('userVoiceCommands').textContent = voiceCommands;
        document.getElementById('userSessions').textContent = sessions;
        document.getElementById('userDaysActive').textContent = activeDays;
    }

    loadPreferencesData() {
        if (!this.auth.currentUser?.preferences) return;

        const prefs = this.auth.currentUser.preferences;

        // Load voice settings
        document.getElementById('userSpeechRate').value = prefs.speechRate || 1.0;
        document.getElementById('userSpeechRateValue').textContent = (prefs.speechRate || 1.0).toFixed(1);
        document.getElementById('userSpeechPitch').value = prefs.speechPitch || 1.0;
        document.getElementById('userSpeechPitchValue').textContent = (prefs.speechPitch || 1.0).toFixed(1);
        document.getElementById('userVolume').value = prefs.volume || 0.7;
        document.getElementById('userVolumeValue').textContent = Math.round((prefs.volume || 0.7) * 100) + '%';

        // Load display settings
        document.getElementById('userHighContrast').checked = prefs.highContrast || false;
        document.getElementById('userReducedMotion').checked = prefs.reducedMotion || false;
        document.getElementById('userLargeText').checked = prefs.largeText || false;
        document.getElementById('userLanguage').value = prefs.language || 'en';

        // Load voice command settings
        document.getElementById('userVoiceConfirmation').checked = prefs.voiceConfirmation !== false;
        document.getElementById('userCommandTimeout').value = prefs.commandTimeout || 10;
        document.getElementById('userContinuousListening').checked = prefs.continuousListening !== false;

        // Load voices
        this.loadVoiceOptions();
    }

    loadVoiceOptions() {
        const voiceSelect = document.getElementById('userVoiceSelect');
        const voices = speechSynthesis.getVoices();
        
        voiceSelect.innerHTML = '<option value="">Default Voice</option>';
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    loadActivityData() {
        if (!this.auth.currentUser) return;

        const period = document.getElementById('activityPeriod').value;
        const activities = this.getUserActivities(period);

        // Update activity stats
        const voiceCommands = activities.filter(a => a.action === 'voice_command').length;
        const timeSpent = this.calculateTimeSpent(activities);
        const interactions = activities.length;

        document.getElementById('periodVoiceCommands').textContent = voiceCommands;
        document.getElementById('periodTimeSpent').textContent = timeSpent;
        document.getElementById('periodInteractions').textContent = interactions;

        // Load recent activity timeline
        this.loadRecentActivity(activities.slice(0, 20));
    }

    loadAccessibilityData() {
        const prefs = this.auth.currentUser?.preferences || {};
        
        // Update accessibility toggles
        document.getElementById('toggleHighContrast').checked = prefs.highContrast || false;
        document.getElementById('toggleLargeText').checked = prefs.largeText || false;
        document.getElementById('toggleReducedMotion').checked = prefs.reducedMotion || false;
    }

    getUserActivities(period) {
        const activities = this.auth.getActivities().filter(a => a.userId === this.auth.currentUser.id);
        const now = new Date();
        
        switch (period) {
            case 'today':
                return activities.filter(a => 
                    new Date(a.timestamp).toDateString() === now.toDateString()
                );
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return activities.filter(a => new Date(a.timestamp) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                return activities.filter(a => new Date(a.timestamp) >= monthAgo);
            default:
                return activities;
        }
    }

    calculateTimeSpent(activities) {
        // Simple calculation based on activity count
        const hours = Math.floor(activities.length / 10);
        const minutes = (activities.length % 10) * 6;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }

    loadRecentActivity(activities) {
        const container = document.getElementById('userRecentActivity');
        
        container.innerHTML = activities.map(activity => `
            <div class="timeline-item">
                <div class="timeline-icon">
                    <i class="fas ${this.getActivityIcon(activity.action)}"></i>
                </div>
                <div class="timeline-content">
                    <div class="timeline-action">${this.formatActivityAction(activity.action)}</div>
                    <div class="timeline-time">${this.formatRelativeTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    showEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        const user = this.auth.currentUser;
        
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editDisability').value = user.disability;
        
        modal.style.display = 'block';
    }

    saveProfile() {
        const formData = new FormData(document.getElementById('editProfileForm'));
        const updatedUser = {
            ...this.auth.currentUser,
            username: formData.get('username'),
            email: formData.get('email'),
            disability: formData.get('disability')
        };

        this.auth.updateUser(updatedUser);
        this.auth.logActivity('profile_updated', { 
            username: updatedUser.username,
            email: updatedUser.email 
        });

        this.closeModals();
        this.loadProfileData();
        this.showNotification('Profile updated successfully!', 'success');
    }

    savePreferences() {
        const preferences = {
            speechRate: parseFloat(document.getElementById('userSpeechRate').value),
            speechPitch: parseFloat(document.getElementById('userSpeechPitch').value),
            volume: parseFloat(document.getElementById('userVolume').value),
            selectedVoice: document.getElementById('userVoiceSelect').value,
            language: document.getElementById('userLanguage').value,
            voiceLanguage: document.getElementById('userVoiceLanguage').value,
            highContrast: document.getElementById('userHighContrast').checked,
            reducedMotion: document.getElementById('userReducedMotion').checked,
            largeText: document.getElementById('userLargeText').checked,
            fontSize: document.getElementById('userFontSize').value,
            voiceConfirmation: document.getElementById('userVoiceConfirmation').checked,
            commandTimeout: parseInt(document.getElementById('userCommandTimeout').value),
            continuousListening: document.getElementById('userContinuousListening').checked
        };

        const updatedUser = {
            ...this.auth.currentUser,
            preferences
        };

        this.auth.updateUser(updatedUser);
        this.auth.logActivity('preferences_updated', preferences);

        // Apply preferences immediately
        this.applyPreferences(preferences);
        
        this.showNotification('Preferences saved successfully!', 'success');
    }

    applyPreferences(preferences) {
        // Apply visual preferences
        document.body.classList.toggle('high-contrast', preferences.highContrast);
        document.body.classList.toggle('reduced-motion', preferences.reducedMotion);
        document.body.classList.toggle('large-text', preferences.largeText);
        document.body.className = document.body.className.replace(/font-size-\w+/g, '');
        document.body.classList.add(`font-size-${preferences.fontSize}`);

        // Update global voice settings if main app is available
        if (window.vaaniSewaApp) {
            window.vaaniSewaApp.speechRate = preferences.speechRate;
            window.vaaniSewaApp.speechPitch = preferences.speechPitch;
            window.vaaniSewaApp.volume = preferences.volume;
            window.vaaniSewaApp.selectedVoice = preferences.selectedVoice;
        }
    }

    toggleAccessibilityFeature(feature, enabled) {
        const preferences = {
            ...this.auth.currentUser.preferences,
            [feature]: enabled
        };

        const updatedUser = {
            ...this.auth.currentUser,
            preferences
        };

        this.auth.updateUser(updatedUser);
        this.auth.logActivity('accessibility_toggle', { feature, enabled });

        // Apply the change immediately
        this.applyPreferences(preferences);
    }

    testVoiceSetting(setting) {
        const testText = "This is a test of your voice settings.";
        const utterance = new SpeechSynthesisUtterance(testText);
        
        switch (setting) {
            case 'rate':
                utterance.rate = parseFloat(document.getElementById('userSpeechRate').value);
                break;
            case 'pitch':
                utterance.pitch = parseFloat(document.getElementById('userSpeechPitch').value);
                break;
            case 'volume':
                utterance.volume = parseFloat(document.getElementById('userVolume').value);
                break;
            case 'voice':
                const voiceName = document.getElementById('userVoiceSelect').value;
                if (voiceName) {
                    const voice = speechSynthesis.getVoices().find(v => v.name === voiceName);
                    if (voice) utterance.voice = voice;
                }
                break;
        }
        
        speechSynthesis.speak(utterance);
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    formatDisabilityType(type) {
        const types = {
            'visual': 'Visual Impairment',
            'hearing': 'Hearing Impairment',
            'mobility': 'Mobility Impairment',
            'cognitive': 'Cognitive Impairment',
            'other': 'Other'
        };
        return types[type] || type;
    }

    formatDate(dateString) {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    }

    formatRelativeTime(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    }

    getActivityIcon(action) {
        const icons = {
            'login': 'fa-sign-in-alt',
            'logout': 'fa-sign-out-alt',
            'voice_command': 'fa-microphone',
            'profile_updated': 'fa-user-edit',
            'preferences_updated': 'fa-cogs',
            'accessibility_toggle': 'fa-universal-access'
        };
        return icons[action] || 'fa-info-circle';
    }

    formatActivityAction(action) {
        const actions = {
            'login': 'Logged in',
            'logout': 'Logged out',
            'voice_command': 'Used voice command',
            'profile_updated': 'Updated profile',
            'preferences_updated': 'Updated preferences',
            'accessibility_toggle': 'Toggled accessibility feature'
        };
        return actions[action] || action;
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
window.UserDashboard = UserDashboard;