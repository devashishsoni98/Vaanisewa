// Data Management and CSV Import/Export System
class DataManager {
    constructor(authSystem) {
        this.auth = authSystem;
    }

    // CSV Export Functions
    exportUsers() {
        const users = this.auth.getUsers();
        const csvData = this.convertUsersToCSV(users);
        this.downloadCSV(csvData, 'vaanisewa-users.csv');
    }

    exportActivities() {
        const activities = this.auth.getActivities();
        const csvData = this.convertActivitiesToCSV(activities);
        this.downloadCSV(csvData, 'vaanisewa-activities.csv');
    }

    exportSystemData() {
        const data = {
            users: this.auth.getUsers(),
            activities: this.auth.getActivities(),
            settings: JSON.parse(localStorage.getItem('vaanisewa-settings') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const jsonData = JSON.stringify(data, null, 2);
        this.downloadFile(jsonData, 'vaanisewa-system-data.json', 'application/json');
    }

    // CSV Import Functions
    importUsers(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const users = this.parseUsersCSV(csv);
                    
                    // Validate and merge with existing users
                    const existingUsers = this.auth.getUsers();
                    const mergedUsers = this.mergeUsers(existingUsers, users);
                    
                    localStorage.setItem('vaanisewa-users', JSON.stringify(mergedUsers));
                    
                    this.auth.logActivity('users_imported', { 
                        count: users.length,
                        filename: file.name 
                    });
                    
                    resolve({
                        success: true,
                        imported: users.length,
                        total: mergedUsers.length
                    });
                } catch (error) {
                    reject({
                        success: false,
                        error: error.message
                    });
                }
            };
            reader.onerror = () => reject({
                success: false,
                error: 'Failed to read file'
            });
            reader.readAsText(file);
        });
    }

    importSystemData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (!this.validateSystemData(data)) {
                        throw new Error('Invalid system data format');
                    }
                    
                    // Backup current data
                    this.createBackup();
                    
                    // Import data
                    if (data.users) {
                        localStorage.setItem('vaanisewa-users', JSON.stringify(data.users));
                    }
                    if (data.activities) {
                        localStorage.setItem('vaanisewa-activities', JSON.stringify(data.activities));
                    }
                    if (data.settings) {
                        localStorage.setItem('vaanisewa-settings', JSON.stringify(data.settings));
                    }
                    
                    this.auth.logActivity('system_data_imported', {
                        filename: file.name,
                        importDate: data.exportDate
                    });
                    
                    resolve({
                        success: true,
                        message: 'System data imported successfully'
                    });
                } catch (error) {
                    reject({
                        success: false,
                        error: error.message
                    });
                }
            };
            reader.onerror = () => reject({
                success: false,
                error: 'Failed to read file'
            });
            reader.readAsText(file);
        });
    }

    // CSV Conversion Functions
    convertUsersToCSV(users) {
        const headers = [
            'ID', 'Username', 'Email', 'Role', 'Disability', 'Status', 
            'Created At', 'Last Login', 'Voice Commands', 'Sessions'
        ];
        
        const rows = users.map(user => {
            const activities = this.auth.getActivities().filter(a => a.userId === user.id);
            const voiceCommands = activities.filter(a => a.action === 'voice_command').length;
            const sessions = activities.filter(a => a.action === 'login').length;
            
            return [
                user.id,
                user.username,
                user.email,
                user.role,
                user.disability,
                user.isActive ? 'Active' : 'Inactive',
                user.createdAt,
                user.lastLogin || 'Never',
                voiceCommands,
                sessions
            ];
        });
        
        return this.arrayToCSV([headers, ...rows]);
    }

    convertActivitiesToCSV(activities) {
        const headers = [
            'ID', 'Action', 'User ID', 'Username', 'Timestamp', 'Data', 'User Agent'
        ];
        
        const rows = activities.map(activity => [
            activity.id,
            activity.action,
            activity.userId,
            activity.username,
            activity.timestamp,
            JSON.stringify(activity.data),
            activity.userAgent
        ]);
        
        return this.arrayToCSV([headers, ...rows]);
    }

    parseUsersCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Validate headers
        const requiredHeaders = ['Username', 'Email', 'Role'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
        }
        
        const users = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            
            if (values.length !== headers.length) {
                console.warn(`Skipping row ${i + 1}: column count mismatch`);
                continue;
            }
            
            const user = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                preferences: {
                    language: 'en',
                    speechRate: 1.0,
                    speechPitch: 1.0,
                    volume: 0.7,
                    highContrast: false,
                    reducedMotion: false
                }
            };
            
            headers.forEach((header, index) => {
                const value = values[index];
                switch (header.toLowerCase()) {
                    case 'username':
                        user.username = value;
                        break;
                    case 'email':
                        user.email = value;
                        break;
                    case 'role':
                        user.role = value.toLowerCase();
                        break;
                    case 'disability':
                        user.disability = value.toLowerCase();
                        break;
                    case 'status':
                        user.isActive = value.toLowerCase() === 'active';
                        break;
                    case 'created at':
                        if (value && value !== 'Never') {
                            user.createdAt = value;
                        }
                        break;
                    case 'last login':
                        if (value && value !== 'Never') {
                            user.lastLogin = value;
                        }
                        break;
                }
            });
            
            // Validate required fields
            if (!user.username || !user.email || !user.role) {
                console.warn(`Skipping row ${i + 1}: missing required fields`);
                continue;
            }
            
            // Validate role
            const validRoles = ['student', 'institution_admin', 'admin'];
            if (!validRoles.includes(user.role)) {
                user.role = 'student'; // Default to student
            }
            
            // Validate disability
            const validDisabilities = ['visual', 'hearing', 'mobility', 'cognitive', 'other'];
            if (!user.disability || !validDisabilities.includes(user.disability)) {
                user.disability = 'other'; // Default to other
            }
            
            users.push(user);
        }
        
        return users;
    }

    mergeUsers(existingUsers, newUsers) {
        const merged = [...existingUsers];
        const existingUsernames = new Set(existingUsers.map(u => u.username));
        const existingEmails = new Set(existingUsers.map(u => u.email));
        
        newUsers.forEach(newUser => {
            // Check for duplicates
            if (existingUsernames.has(newUser.username)) {
                console.warn(`Skipping duplicate username: ${newUser.username}`);
                return;
            }
            if (existingEmails.has(newUser.email)) {
                console.warn(`Skipping duplicate email: ${newUser.email}`);
                return;
            }
            
            merged.push(newUser);
            existingUsernames.add(newUser.username);
            existingEmails.add(newUser.email);
        });
        
        return merged;
    }

    validateSystemData(data) {
        // Check if data has expected structure
        if (typeof data !== 'object' || data === null) {
            return false;
        }
        
        // Validate users array
        if (data.users && !Array.isArray(data.users)) {
            return false;
        }
        
        // Validate activities array
        if (data.activities && !Array.isArray(data.activities)) {
            return false;
        }
        
        // Validate settings object
        if (data.settings && typeof data.settings !== 'object') {
            return false;
        }
        
        return true;
    }

    createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupData = {
            users: this.auth.getUsers(),
            activities: this.auth.getActivities(),
            settings: JSON.parse(localStorage.getItem('vaanisewa-settings') || '{}'),
            backupDate: new Date().toISOString()
        };
        
        localStorage.setItem(`vaanisewa-backup-${timestamp}`, JSON.stringify(backupData));
        
        // Keep only last 5 backups
        this.cleanupBackups();
    }

    cleanupBackups() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('vaanisewa-backup-'));
        if (keys.length > 5) {
            keys.sort().slice(0, keys.length - 5).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }

    getBackups() {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('vaanisewa-backup-'));
        return keys.sort().reverse().map(key => {
            const data = JSON.parse(localStorage.getItem(key));
            return {
                key,
                date: data.backupDate,
                userCount: data.users?.length || 0,
                activityCount: data.activities?.length || 0
            };
        });
    }

    restoreBackup(backupKey) {
        const backupData = localStorage.getItem(backupKey);
        if (!backupData) {
            throw new Error('Backup not found');
        }
        
        const data = JSON.parse(backupData);
        
        if (data.users) {
            localStorage.setItem('vaanisewa-users', JSON.stringify(data.users));
        }
        if (data.activities) {
            localStorage.setItem('vaanisewa-activities', JSON.stringify(data.activities));
        }
        if (data.settings) {
            localStorage.setItem('vaanisewa-settings', JSON.stringify(data.settings));
        }
        
        this.auth.logActivity('backup_restored', {
            backupKey,
            backupDate: data.backupDate
        });
        
        return {
            success: true,
            message: 'Backup restored successfully'
        };
    }

    // Utility Functions
    arrayToCSV(data) {
        return data.map(row => 
            row.map(field => {
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                const stringField = String(field);
                if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                    return `"${stringField.replace(/"/g, '""')}"`;
                }
                return stringField;
            }).join(',')
        ).join('\n');
    }

    downloadCSV(csvContent, filename) {
        this.downloadFile(csvContent, filename, 'text/csv');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Data Validation and Sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        // Remove potentially dangerous characters
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateUsername(username) {
        // Username should be 3-30 characters, alphanumeric and underscores only
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        return usernameRegex.test(username);
    }

    validateRole(role) {
        const validRoles = ['student', 'institution_admin', 'admin'];
        return validRoles.includes(role);
    }

    // Analytics and Reporting
    generateUserReport() {
        const users = this.auth.getUsers();
        const activities = this.auth.getActivities();
        
        const report = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive).length,
            usersByRole: this.groupBy(users, 'role'),
            usersByDisability: this.groupBy(users, 'disability'),
            registrationTrend: this.getRegistrationTrend(users),
            activitySummary: this.getActivitySummary(activities),
            topUsers: this.getTopUsers(users, activities),
            generatedAt: new Date().toISOString()
        };
        
        return report;
    }

    generateSystemReport() {
        const users = this.auth.getUsers();
        const activities = this.auth.getActivities();
        const settings = JSON.parse(localStorage.getItem('vaanisewa-settings') || '{}');
        
        const report = {
            system: {
                version: '1.0.0',
                totalStorage: this.calculateStorageUsage(),
                uptime: this.calculateUptime(),
                lastBackup: this.getLastBackupDate()
            },
            users: {
                total: users.length,
                active: users.filter(u => u.isActive).length,
                byRole: this.groupBy(users, 'role'),
                recentRegistrations: users.filter(u => 
                    new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length
            },
            activities: {
                total: activities.length,
                today: activities.filter(a => 
                    new Date(a.timestamp).toDateString() === new Date().toDateString()
                ).length,
                byAction: this.groupBy(activities, 'action'),
                voiceCommands: activities.filter(a => a.action === 'voice_command').length
            },
            settings: settings,
            generatedAt: new Date().toISOString()
        };
        
        return report;
    }

    // Helper Functions
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || 'unknown';
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }

    getRegistrationTrend(users) {
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const count = users.filter(u => 
                new Date(u.createdAt).toDateString() === dateString
            ).length;
            
            last30Days.push({
                date: dateString,
                registrations: count
            });
        }
        return last30Days;
    }

    getActivitySummary(activities) {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const dayActivities = activities.filter(a => 
                new Date(a.timestamp).toDateString() === dateString
            );
            
            last7Days.push({
                date: dateString,
                total: dayActivities.length,
                voiceCommands: dayActivities.filter(a => a.action === 'voice_command').length,
                logins: dayActivities.filter(a => a.action === 'login').length
            });
        }
        return last7Days;
    }

    getTopUsers(users, activities) {
        return users.map(user => {
            const userActivities = activities.filter(a => a.userId === user.id);
            return {
                username: user.username,
                role: user.role,
                totalActivities: userActivities.length,
                voiceCommands: userActivities.filter(a => a.action === 'voice_command').length,
                lastActive: userActivities.length > 0 ? 
                    Math.max(...userActivities.map(a => new Date(a.timestamp).getTime())) : null
            };
        })
        .sort((a, b) => b.totalActivities - a.totalActivities)
        .slice(0, 10);
    }

    calculateStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('vaanisewa-')) {
                total += localStorage[key].length;
            }
        }
        return `${(total / 1024).toFixed(2)} KB`;
    }

    calculateUptime() {
        // Simple uptime calculation based on first activity
        const activities = this.auth.getActivities();
        if (activities.length === 0) return '0 days';
        
        const firstActivity = new Date(activities[activities.length - 1].timestamp);
        const now = new Date();
        const diffTime = Math.abs(now - firstActivity);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return `${diffDays} days`;
    }

    getLastBackupDate() {
        const backups = this.getBackups();
        return backups.length > 0 ? backups[0].date : 'Never';
    }
}

// Export for global use
window.DataManager = DataManager;