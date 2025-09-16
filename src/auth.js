// Authentication and Authorization System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        this.init();
    }

    init() {
        this.loadSession();
        this.startSessionTimer();
    }

    // JWT Token simulation
    generateToken(user) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            userId: user.id,
            username: user.username,
            role: user.role,
            exp: Date.now() + this.sessionTimeout
        }));
        const signature = btoa(`signature_${user.id}_${Date.now()}`);
        return `${header}.${payload}.${signature}`;
    }

    validateToken(token) {
        try {
            const [header, payload, signature] = token.split('.');
            const decodedPayload = JSON.parse(atob(payload));
            
            if (decodedPayload.exp < Date.now()) {
                return null; // Token expired
            }
            
            return decodedPayload;
        } catch (error) {
            return null;
        }
    }

    login(username, password, role = 'student') {
        // Mock authentication - in real app, this would call backend API
        const users = this.getUsers();
        const user = users.find(u => u.username === username);
        
        if (!user) {
            // Create new user if doesn't exist (for demo purposes)
            const newUser = {
                id: Date.now().toString(),
                username,
                email: `${username}@example.com`,
                role,
                disability: 'visual',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
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
            users.push(newUser);
            localStorage.setItem('vaanisewa-users', JSON.stringify(users));
            user = newUser;
        } else {
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.updateUser(user);
        }

        const token = this.generateToken(user);
        const session = {
            user,
            token,
            loginTime: Date.now(),
            lastActivity: Date.now()
        };

        localStorage.setItem('vaanisewa-session', JSON.stringify(session));
        this.currentUser = user;
        this.logActivity('login', { username, role });
        
        return { success: true, user, token };
    }

    logout() {
        if (this.currentUser) {
            this.logActivity('logout', { username: this.currentUser.username });
        }
        
        localStorage.removeItem('vaanisewa-session');
        this.currentUser = null;
        this.clearSessionTimer();
        
        return { success: true };
    }

    loadSession() {
        const sessionData = localStorage.getItem('vaanisewa-session');
        if (!sessionData) return null;

        try {
            const session = JSON.parse(sessionData);
            const tokenData = this.validateToken(session.token);
            
            if (!tokenData) {
                this.logout();
                return null;
            }

            this.currentUser = session.user;
            return session;
        } catch (error) {
            this.logout();
            return null;
        }
    }

    updateLastActivity() {
        const sessionData = localStorage.getItem('vaanisewa-session');
        if (sessionData) {
            const session = JSON.parse(sessionData);
            session.lastActivity = Date.now();
            localStorage.setItem('vaanisewa-session', JSON.stringify(session));
        }
    }

    startSessionTimer() {
        this.clearSessionTimer();
        this.sessionTimer = setInterval(() => {
            const session = this.loadSession();
            if (session && Date.now() - session.lastActivity > this.sessionTimeout) {
                this.logout();
                window.dispatchEvent(new CustomEvent('sessionExpired'));
            }
        }, 60000); // Check every minute
    }

    clearSessionTimer() {
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    hasRole(requiredRole) {
        if (!this.currentUser) return false;
        
        const roleHierarchy = {
            'student': 1,
            'institution_admin': 2,
            'admin': 3
        };
        
        const userLevel = roleHierarchy[this.currentUser.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        return userLevel >= requiredLevel;
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('vaanisewa-users') || '[]');
    }

    updateUser(userData) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userData.id);
        
        if (index !== -1) {
            users[index] = { ...users[index], ...userData };
            localStorage.setItem('vaanisewa-users', JSON.stringify(users));
            
            if (this.currentUser && this.currentUser.id === userData.id) {
                this.currentUser = users[index];
            }
            
            return users[index];
        }
        
        return null;
    }

    deleteUser(userId) {
        const users = this.getUsers();
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('vaanisewa-users', JSON.stringify(filteredUsers));
        
        this.logActivity('user_deleted', { userId });
        return true;
    }

    logActivity(action, data = {}) {
        const activities = JSON.parse(localStorage.getItem('vaanisewa-activities') || '[]');
        const activity = {
            id: Date.now().toString(),
            action,
            data,
            userId: this.currentUser?.id || 'anonymous',
            username: this.currentUser?.username || 'anonymous',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: '127.0.0.1' // Mock IP
        };
        
        activities.unshift(activity);
        
        // Keep only last 1000 activities
        if (activities.length > 1000) {
            activities.splice(1000);
        }
        
        localStorage.setItem('vaanisewa-activities', JSON.stringify(activities));
    }

    getActivities(limit = 100) {
        const activities = JSON.parse(localStorage.getItem('vaanisewa-activities') || '[]');
        return activities.slice(0, limit);
    }

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const errors = [];
        
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        
        if (score < 3) return 'weak';
        if (score < 5) return 'medium';
        return 'strong';
    }
}

// Export for use in other modules
window.AuthSystem = AuthSystem;