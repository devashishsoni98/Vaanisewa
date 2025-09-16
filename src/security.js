// Security and Validation System
class SecurityManager {
    constructor() {
        this.maxLoginAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.init();
    }

    init() {
        this.setupCSRFProtection();
        this.setupXSSProtection();
        this.setupInputValidation();
        this.monitorSecurity();
    }

    // Input Validation and Sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }

        // Remove HTML tags and potentially dangerous content
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
            .replace(/<link\b[^<]*>/gi, '')
            .replace(/<meta\b[^<]*>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }

    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const sanitizedEmail = this.sanitizeInput(email);
        
        if (!emailRegex.test(sanitizedEmail)) {
            return { isValid: false, error: 'Invalid email format' };
        }
        
        if (sanitizedEmail.length > 254) {
            return { isValid: false, error: 'Email too long' };
        }
        
        return { isValid: true, value: sanitizedEmail };
    }

    validateUsername(username) {
        const sanitizedUsername = this.sanitizeInput(username);
        
        if (sanitizedUsername.length < 3) {
            return { isValid: false, error: 'Username must be at least 3 characters' };
        }
        
        if (sanitizedUsername.length > 30) {
            return { isValid: false, error: 'Username must be less than 30 characters' };
        }
        
        const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
        if (!usernameRegex.test(sanitizedUsername)) {
            return { isValid: false, error: 'Username can only contain letters, numbers, dots, hyphens, and underscores' };
        }
        
        // Check for reserved usernames
        const reservedUsernames = ['admin', 'administrator', 'root', 'system', 'api', 'www', 'mail', 'ftp'];
        if (reservedUsernames.includes(sanitizedUsername.toLowerCase())) {
            return { isValid: false, error: 'Username is reserved' };
        }
        
        return { isValid: true, value: sanitizedUsername };
    }

    validatePassword(password) {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        
        if (password.length > 128) {
            errors.push('Password must be less than 128 characters');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        // Check for common weak passwords
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123', 
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];
        
        if (commonPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common');
        }
        
        // Check for sequential characters
        if (this.hasSequentialChars(password)) {
            errors.push('Password should not contain sequential characters');
        }
        
        const strength = this.calculatePasswordStrength(password);
        
        return {
            isValid: errors.length === 0,
            errors,
            strength
        };
    }

    hasSequentialChars(password) {
        const sequences = ['123', '234', '345', '456', '567', '678', '789', 'abc', 'bcd', 'cde', 'def'];
        return sequences.some(seq => password.toLowerCase().includes(seq));
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length bonus
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        
        // Character variety
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
        
        // Complexity bonus
        if (password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 2;
        }
        
        if (score < 3) return 'weak';
        if (score < 6) return 'medium';
        return 'strong';
    }

    // Login Attempt Monitoring
    trackLoginAttempt(username, success) {
        const attempts = JSON.parse(localStorage.getItem('vaanisewa-login-attempts') || '{}');
        const now = Date.now();
        
        if (!attempts[username]) {
            attempts[username] = { count: 0, lastAttempt: now, lockedUntil: null };
        }
        
        if (success) {
            // Reset attempts on successful login
            delete attempts[username];
        } else {
            attempts[username].count += 1;
            attempts[username].lastAttempt = now;
            
            if (attempts[username].count >= this.maxLoginAttempts) {
                attempts[username].lockedUntil = now + this.lockoutDuration;
            }
        }
        
        localStorage.setItem('vaanisewa-login-attempts', JSON.stringify(attempts));
        
        return {
            isLocked: attempts[username]?.lockedUntil > now,
            attemptsRemaining: Math.max(0, this.maxLoginAttempts - (attempts[username]?.count || 0)),
            lockoutTime: attempts[username]?.lockedUntil
        };
    }

    isAccountLocked(username) {
        const attempts = JSON.parse(localStorage.getItem('vaanisewa-login-attempts') || '{}');
        const userAttempts = attempts[username];
        
        if (!userAttempts) return false;
        
        const now = Date.now();
        if (userAttempts.lockedUntil && userAttempts.lockedUntil > now) {
            return {
                isLocked: true,
                lockoutTime: userAttempts.lockedUntil,
                remainingTime: userAttempts.lockedUntil - now
            };
        }
        
        // Clean up expired lockouts
        if (userAttempts.lockedUntil && userAttempts.lockedUntil <= now) {
            delete attempts[username];
            localStorage.setItem('vaanisewa-login-attempts', JSON.stringify(attempts));
        }
        
        return { isLocked: false };
    }

    // CSRF Protection
    setupCSRFProtection() {
        this.csrfToken = this.generateCSRFToken();
        
        // Add CSRF token to all forms
        document.addEventListener('DOMContentLoaded', () => {
            this.addCSRFTokenToForms();
        });
    }

    generateCSRFToken() {
        return btoa(Math.random().toString(36).substr(2, 9) + Date.now().toString(36));
    }

    addCSRFTokenToForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = this.csrfToken;
            form.appendChild(csrfInput);
        });
    }

    validateCSRFToken(token) {
        return token === this.csrfToken;
    }

    // XSS Protection
    setupXSSProtection() {
        // Content Security Policy simulation
        this.cspRules = {
            'script-src': ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
            'style-src': ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
            'img-src': ["'self'", 'data:', 'https:'],
            'font-src': ["'self'", 'cdnjs.cloudflare.com']
        };
        
        // Monitor for potential XSS attempts
        this.monitorXSSAttempts();
    }

    monitorXSSAttempts() {
        // Monitor input fields for potential XSS
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                const value = e.target.value;
                if (this.detectXSSAttempt(value)) {
                    this.logSecurityEvent('xss_attempt', {
                        field: e.target.name || e.target.id,
                        value: value.substring(0, 100) // Log first 100 chars only
                    });
                    
                    // Sanitize the input
                    e.target.value = this.sanitizeInput(value);
                }
            }
        });
    }

    detectXSSAttempt(input) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /eval\s*\(/gi,
            /expression\s*\(/gi
        ];
        
        return xssPatterns.some(pattern => pattern.test(input));
    }

    // Input Validation Setup
    setupInputValidation() {
        document.addEventListener('DOMContentLoaded', () => {
            this.addInputValidation();
        });
    }

    addInputValidation() {
        // Email validation
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const validation = this.validateEmail(e.target.value);
                this.showValidationMessage(e.target, validation);
            });
        });
        
        // Username validation
        const usernameInputs = document.querySelectorAll('input[name="username"], #regUsername, #loginUsername');
        usernameInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const validation = this.validateUsername(e.target.value);
                this.showValidationMessage(e.target, validation);
            });
        });
        
        // Password validation
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const validation = this.validatePassword(e.target.value);
                this.showPasswordStrength(e.target, validation);
            });
        });
    }

    showValidationMessage(input, validation) {
        // Remove existing validation message
        const existingMessage = input.parentNode.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (!validation.isValid && input.value.trim() !== '') {
            const message = document.createElement('div');
            message.className = 'validation-message error';
            message.textContent = validation.error || validation.errors?.[0];
            input.parentNode.appendChild(message);
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    }

    showPasswordStrength(input, validation) {
        // Remove existing strength indicator
        const existingIndicator = input.parentNode.querySelector('.password-strength');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (input.value.trim() !== '') {
            const indicator = document.createElement('div');
            indicator.className = `password-strength ${validation.strength}`;
            
            const strengthText = {
                'weak': 'Weak',
                'medium': 'Medium',
                'strong': 'Strong'
            };
            
            indicator.innerHTML = `
                <div class="strength-bar">
                    <div class="strength-fill ${validation.strength}"></div>
                </div>
                <span class="strength-text">${strengthText[validation.strength]}</span>
            `;
            
            input.parentNode.appendChild(indicator);
            
            // Show errors if any
            if (validation.errors.length > 0) {
                const errorList = document.createElement('ul');
                errorList.className = 'password-errors';
                validation.errors.forEach(error => {
                    const li = document.createElement('li');
                    li.textContent = error;
                    errorList.appendChild(li);
                });
                input.parentNode.appendChild(errorList);
            }
        }
    }

    // Security Monitoring
    monitorSecurity() {
        // Monitor for suspicious activity
        this.setupActivityMonitoring();
        this.setupRateLimiting();
        this.setupSessionMonitoring();
    }

    setupActivityMonitoring() {
        let activityCount = 0;
        const activityWindow = 60000; // 1 minute
        const maxActivities = 100;
        
        document.addEventListener('click', () => {
            activityCount++;
            
            if (activityCount > maxActivities) {
                this.logSecurityEvent('suspicious_activity', {
                    type: 'excessive_clicks',
                    count: activityCount,
                    timeWindow: activityWindow
                });
            }
        });
        
        // Reset activity count every minute
        setInterval(() => {
            activityCount = 0;
        }, activityWindow);
    }

    setupRateLimiting() {
        const rateLimits = new Map();
        const maxRequests = 10;
        const timeWindow = 60000; // 1 minute
        
        // Monitor form submissions
        document.addEventListener('submit', (e) => {
            const formId = e.target.id || 'unknown';
            const now = Date.now();
            
            if (!rateLimits.has(formId)) {
                rateLimits.set(formId, []);
            }
            
            const requests = rateLimits.get(formId);
            
            // Remove old requests outside time window
            const recentRequests = requests.filter(time => now - time < timeWindow);
            
            if (recentRequests.length >= maxRequests) {
                e.preventDefault();
                this.logSecurityEvent('rate_limit_exceeded', {
                    form: formId,
                    requests: recentRequests.length
                });
                this.showSecurityAlert('Too many requests. Please wait before trying again.');
                return;
            }
            
            recentRequests.push(now);
            rateLimits.set(formId, recentRequests);
        });
    }

    setupSessionMonitoring() {
        let lastActivity = Date.now();
        
        // Update last activity time
        ['click', 'keypress', 'mousemove', 'scroll'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity = Date.now();
            });
        });
        
        // Check for session timeout
        setInterval(() => {
            const now = Date.now();
            if (now - lastActivity > this.sessionTimeout) {
                this.logSecurityEvent('session_timeout', {
                    lastActivity: new Date(lastActivity).toISOString()
                });
                
                // Trigger session expiration
                window.dispatchEvent(new CustomEvent('sessionExpired'));
            }
        }, 60000); // Check every minute
    }

    // Security Event Logging
    logSecurityEvent(type, data) {
        const securityLogs = JSON.parse(localStorage.getItem('vaanisewa-security-logs') || '[]');
        
        const event = {
            id: Date.now().toString(),
            type,
            data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ip: '127.0.0.1' // Mock IP for demo
        };
        
        securityLogs.unshift(event);
        
        // Keep only last 1000 security events
        if (securityLogs.length > 1000) {
            securityLogs.splice(1000);
        }
        
        localStorage.setItem('vaanisewa-security-logs', JSON.stringify(securityLogs));
        
        // Alert for critical security events
        const criticalEvents = ['xss_attempt', 'suspicious_activity', 'rate_limit_exceeded'];
        if (criticalEvents.includes(type)) {
            console.warn('Security Event:', event);
        }
    }

    getSecurityLogs(limit = 100) {
        const logs = JSON.parse(localStorage.getItem('vaanisewa-security-logs') || '[]');
        return logs.slice(0, limit);
    }

    showSecurityAlert(message) {
        const alert = document.createElement('div');
        alert.className = 'security-alert';
        alert.innerHTML = `
            <div class="alert-content">
                <i class="fas fa-shield-alt"></i>
                <span>${message}</span>
                <button class="alert-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
        
        // Manual close
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.remove();
        });
    }

    // Data Encryption Simulation
    encryptData(data, key = 'vaanisewa-key') {
        // Simple encryption simulation using base64 and key rotation
        const jsonString = JSON.stringify(data);
        const encoded = btoa(jsonString);
        
        // Simple key-based character rotation
        let encrypted = '';
        for (let i = 0; i < encoded.length; i++) {
            const char = encoded.charCodeAt(i);
            const keyChar = key.charCodeAt(i % key.length);
            encrypted += String.fromCharCode(char ^ keyChar);
        }
        
        return btoa(encrypted);
    }

    decryptData(encryptedData, key = 'vaanisewa-key') {
        try {
            const encrypted = atob(encryptedData);
            
            // Reverse the key-based character rotation
            let decrypted = '';
            for (let i = 0; i < encrypted.length; i++) {
                const char = encrypted.charCodeAt(i);
                const keyChar = key.charCodeAt(i % key.length);
                decrypted += String.fromCharCode(char ^ keyChar);
            }
            
            const jsonString = atob(decrypted);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    // Security Report Generation
    generateSecurityReport() {
        const logs = this.getSecurityLogs();
        const loginAttempts = JSON.parse(localStorage.getItem('vaanisewa-login-attempts') || '{}');
        
        const report = {
            summary: {
                totalSecurityEvents: logs.length,
                criticalEvents: logs.filter(log => 
                    ['xss_attempt', 'suspicious_activity', 'rate_limit_exceeded'].includes(log.type)
                ).length,
                lockedAccounts: Object.keys(loginAttempts).filter(username => 
                    loginAttempts[username].lockedUntil > Date.now()
                ).length,
                reportGeneratedAt: new Date().toISOString()
            },
            eventsByType: this.groupEventsByType(logs),
            recentEvents: logs.slice(0, 20),
            loginAttempts: this.formatLoginAttempts(loginAttempts),
            recommendations: this.generateSecurityRecommendations(logs)
        };
        
        return report;
    }

    groupEventsByType(logs) {
        return logs.reduce((groups, log) => {
            groups[log.type] = (groups[log.type] || 0) + 1;
            return groups;
        }, {});
    }

    formatLoginAttempts(attempts) {
        return Object.entries(attempts).map(([username, data]) => ({
            username,
            attempts: data.count,
            lastAttempt: new Date(data.lastAttempt).toISOString(),
            isLocked: data.lockedUntil > Date.now(),
            lockedUntil: data.lockedUntil ? new Date(data.lockedUntil).toISOString() : null
        }));
    }

    generateSecurityRecommendations(logs) {
        const recommendations = [];
        
        const xssAttempts = logs.filter(log => log.type === 'xss_attempt').length;
        if (xssAttempts > 0) {
            recommendations.push('Consider implementing stricter input validation and Content Security Policy');
        }
        
        const rateLimitExceeded = logs.filter(log => log.type === 'rate_limit_exceeded').length;
        if (rateLimitExceeded > 5) {
            recommendations.push('Review rate limiting settings - multiple violations detected');
        }
        
        const suspiciousActivity = logs.filter(log => log.type === 'suspicious_activity').length;
        if (suspiciousActivity > 0) {
            recommendations.push('Monitor user activity patterns for potential automated attacks');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Security posture appears good - continue monitoring');
        }
        
        return recommendations;
    }
}

// Export for global use
window.SecurityManager = SecurityManager;