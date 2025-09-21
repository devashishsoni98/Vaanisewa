// Contextual Help System
class ContextualHelp {
    constructor(app) {
        this.app = app;
        this.isActive = false;
        this.currentTooltip = null;
        this.helpData = {
            // Header elements
            '.logo': {
                title: 'VaaniSewa Logo',
                content: 'Click to return to the main dashboard. VaaniSewa means "Voice Service" in Hindi.',
                voice: 'This is the VaaniSewa logo. Click here to return to the main dashboard.'
            },
            '#languageToggle': {
                title: 'Language Toggle',
                content: 'Switch between English and Hindi interface. Voice commands work in both languages.',
                voice: 'Language toggle button. Switch between English and Hindi interface and voice commands.'
            },
            '.volume-control': {
                title: 'Volume Control',
                content: 'Adjust the volume of voice feedback. You can also say "volume up" or "volume down".',
                voice: 'Volume control. Adjust voice feedback volume using these buttons or voice commands.'
            },
            '.listening-status': {
                title: 'Voice Status',
                content: 'Shows whether the system is listening for voice commands. Green means active.',
                voice: 'Voice recognition status indicator. Green means the system is listening for your commands.'
            },

            // Navigation elements
            '.btn-primary': {
                title: 'Primary Action',
                content: 'Main action button. You can click it or use voice commands to activate.',
                voice: 'Primary action button. Click or use voice commands to activate this feature.'
            },
            '.btn-secondary': {
                title: 'Secondary Action',
                content: 'Alternative action button. Provides additional options for the current screen.',
                voice: 'Secondary action button. Provides additional options for the current screen.'
            },

            // Form elements
            '.mic-btn': {
                title: 'Voice Input',
                content: 'Click to use voice input for this field. Speak clearly when the button turns red.',
                voice: 'Voice input button. Click to speak your input instead of typing.'
            },
            '.form-input': {
                title: 'Text Input',
                content: 'Enter text here or use the microphone button for voice input.',
                voice: 'Text input field. Type here or use the microphone button for voice input.'
            },

            // Dashboard elements
            '.user-info': {
                title: 'User Information',
                content: 'Your profile information and account details are displayed here.',
                voice: 'User information panel showing your profile and account details.'
            },
            '.dashboard-actions': {
                title: 'Dashboard Actions',
                content: 'Main navigation buttons. You can click them or use voice commands like "settings" or "help".',
                voice: 'Dashboard navigation. Use these buttons or voice commands like settings, help, or logout.'
            },

            // Settings elements
            '.settings-group': {
                title: 'Settings Group',
                content: 'Related settings are grouped together. Adjust these to customize your experience.',
                voice: 'Settings group. Adjust these options to customize your VaaniSewa experience.'
            },
            'input[type="range"]': {
                title: 'Slider Control',
                content: 'Drag the slider or use arrow keys to adjust the value. Changes apply immediately.',
                voice: 'Slider control. Drag to adjust the value or use arrow keys for precise control.'
            },

            // Help elements
            '.voice-commands': {
                title: 'Voice Commands',
                content: 'List of available voice commands. These work in both English and Hindi.',
                voice: 'Voice commands reference. These commands work in both English and Hindi.'
            },

            // Admin elements (if user has access)
            '.admin-nav': {
                title: 'Admin Navigation',
                content: 'Administrative functions for managing users and system settings.',
                voice: 'Admin navigation panel for managing users and system settings.'
            },
            '.stats-grid': {
                title: 'Statistics Overview',
                content: 'Key metrics and statistics about system usage and performance.',
                voice: 'Statistics overview showing key metrics about system usage and performance.'
            },
            
            // Onboarding specific elements
            '.onboarding-wizard': {
                title: 'Onboarding Wizard',
                content: 'Step-by-step tutorial to help you learn VaaniSewa features and voice commands.',
                voice: 'Onboarding wizard. Follow the steps to learn VaaniSewa features and voice commands.'
            },
            '.wizard-demo-area': {
                title: 'Interactive Demo',
                content: 'Try the interactive demonstrations to practice using VaaniSewa features.',
                voice: 'Interactive demo area. Practice using VaaniSewa features with these demonstrations.'
            }
        };
        
        this.init();
    }

    init() {
        this.createHelpInterface();
        this.setupEventListeners();
        this.addHelpButtons();
    }

    createHelpInterface() {
        const helpHTML = `
            <!-- Persistent Help Button -->
            <button id="persistentHelpBtn" class="help-button persistent-help" aria-label="Toggle contextual help">
                <i class="fas fa-question-circle"></i>
                <span class="help-label">Help</span>
            </button>

            <!-- Help Mode Overlay -->
            <div id="helpModeOverlay" class="help-mode-overlay">
                <div class="help-mode-header">
                    <div class="help-mode-title">
                        <i class="fas fa-question-circle"></i>
                        <span>Help Mode Active</span>
                    </div>
                    <div class="help-mode-instructions">
                        Click on any element to get help, or press ESC to exit
                    </div>
                    <button class="help-mode-close" id="exitHelpMode">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <!-- Tooltip Container -->
            <div id="helpTooltip" class="help-tooltip">
                <div class="tooltip-header">
                    <h4 id="tooltipTitle">Help</h4>
                    <div class="tooltip-controls">
                        <button class="tooltip-speak" id="tooltipSpeak" aria-label="Read aloud">
                            <i class="fas fa-volume-up"></i>
                        </button>
                        <button class="tooltip-close" id="tooltipClose" aria-label="Close tooltip">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="tooltip-content">
                    <p id="tooltipContent">Click on any element to get contextual help.</p>
                </div>
                <div class="tooltip-arrow"></div>
            </div>

            <!-- Help Panel -->
            <div id="helpPanel" class="help-panel">
                <div class="help-panel-header">
                    <h3>Contextual Help</h3>
                    <button class="help-panel-close" id="closeHelpPanel">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="help-panel-content">
                    <div class="help-section">
                        <h4>How to Use Help</h4>
                        <ul>
                            <li>Click the <i class="fas fa-question-circle"></i> button to enter help mode</li>
                            <li>Click on any element to see its help information</li>
                            <li>Use the <i class="fas fa-volume-up"></i> button to hear help content</li>
                            <li>Press ESC or click outside to exit help mode</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h4>Voice Commands for Help</h4>
                        <ul>
                            <li>"help" - Show general help</li>
                            <li>"what is this" - Get help for current screen</li>
                            <li>"how do I" - Get task-specific help</li>
                            <li>"explain" - Get detailed explanations</li>
                        </ul>
                    </div>

                    <div class="help-section">
                        <h4>Keyboard Shortcuts</h4>
                        <ul>
                            <li><kbd>F1</kbd> - Toggle help mode</li>
                            <li><kbd>ESC</kbd> - Exit help mode</li>
                            <li><kbd>Tab</kbd> - Navigate between elements</li>
                            <li><kbd>Enter</kbd> - Activate focused element</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', helpHTML);
    }

    setupEventListeners() {
        // Persistent help button
        document.getElementById('persistentHelpBtn').addEventListener('click', () => {
            this.toggleHelpMode();
        });

        // Exit help mode
        document.getElementById('exitHelpMode').addEventListener('click', () => {
            this.exitHelpMode();
        });

        // Tooltip controls
        document.getElementById('tooltipSpeak').addEventListener('click', () => {
            this.speakCurrentTooltip();
        });

        document.getElementById('tooltipClose').addEventListener('click', () => {
            this.hideTooltip();
        });

        // Help panel
        document.getElementById('closeHelpPanel').addEventListener('click', () => {
            this.hideHelpPanel();
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.toggleHelpMode();
            } else if (e.key === 'Escape' && this.isActive) {
                this.exitHelpMode();
            }
        });

        // Click handler for help mode
        document.addEventListener('click', (e) => {
            if (this.isActive) {
                e.preventDefault();
                e.stopPropagation();
                this.showHelpForElement(e.target);
            }
        });

        // Voice command integration
        if (this.app) {
            this.setupVoiceCommands();
        }
    }

    setupVoiceCommands() {
        // Add help-specific voice commands
        const helpCommands = {
            en: {
                'help mode': () => this.toggleHelpMode(),
                'what is this': () => this.explainCurrentScreen(),
                'how do I': () => this.showTaskHelp(),
                'explain': () => this.showDetailedHelp(),
                'exit help': () => this.exitHelpMode()
            },
            hi: {
                'सहायता मोड': () => this.toggleHelpMode(),
                'यह क्या है': () => this.explainCurrentScreen(),
                'मैं कैसे करूं': () => this.showTaskHelp(),
                'समझाएं': () => this.showDetailedHelp(),
                'सहायता बंद करें': () => this.exitHelpMode()
            }
        };

        // Merge with existing voice commands
        if (this.app.voiceCommands) {
            Object.keys(helpCommands).forEach(lang => {
                this.app.voiceCommands[lang] = {
                    ...this.app.voiceCommands[lang],
                    ...helpCommands[lang]
                };
            });
        }
    }

    addHelpButtons() {
        // Add help buttons to major sections
        const sections = [
            '.header-content',
            '.dashboard-content',
            '.settings-content',
            '.help-content',
            '.form-container'
        ];

        sections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section && !section.querySelector('.section-help-btn')) {
                const helpBtn = document.createElement('button');
                helpBtn.className = 'section-help-btn help-button';
                helpBtn.innerHTML = '<i class="fas fa-question-circle"></i>';
                helpBtn.setAttribute('aria-label', 'Get help for this section');
                helpBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showHelpForElement(section);
                });
                
                section.style.position = 'relative';
                section.appendChild(helpBtn);
            }
        });
    }

    toggleHelpMode() {
        if (this.isActive) {
            this.exitHelpMode();
        } else {
            this.enterHelpMode();
        }
    }

    enterHelpMode() {
        this.isActive = true;
        document.body.classList.add('help-mode-active');
        document.getElementById('helpModeOverlay').classList.add('active');
        document.getElementById('persistentHelpBtn').classList.add('active');
        
        this.speak('Help mode activated. Click on any element to get contextual help, or press escape to exit.');
        
        // Add help indicators to interactive elements
        this.addHelpIndicators();
    }

    exitHelpMode() {
        this.isActive = false;
        document.body.classList.remove('help-mode-active');
        document.getElementById('helpModeOverlay').classList.remove('active');
        document.getElementById('persistentHelpBtn').classList.remove('active');
        
        this.hideTooltip();
        this.removeHelpIndicators();
        
        this.speak('Help mode deactivated.');
    }

    addHelpIndicators() {
        // Add visual indicators to elements with help data
        Object.keys(this.helpData).forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.classList.contains('help-indicator-added')) {
                    element.classList.add('help-available', 'help-indicator-added');
                }
            });
        });
    }

    removeHelpIndicators() {
        document.querySelectorAll('.help-available').forEach(element => {
            element.classList.remove('help-available', 'help-indicator-added');
        });
    }

    showHelpForElement(element) {
        const helpInfo = this.getHelpForElement(element);
        if (helpInfo) {
            this.showTooltip(element, helpInfo);
            this.speak(helpInfo.voice || helpInfo.content);
        } else {
            this.showGenericHelp(element);
        }
    }

    getHelpForElement(element) {
        // Try to find help data for the element or its parents
        let currentElement = element;
        
        while (currentElement && currentElement !== document.body) {
            // Check by exact selector match
            for (const selector in this.helpData) {
                if (currentElement.matches && currentElement.matches(selector)) {
                    return this.helpData[selector];
                }
            }
            
            // Check by class names
            if (currentElement.className) {
                const classes = currentElement.className.split(' ');
                for (const className of classes) {
                    const selector = `.${className}`;
                    if (this.helpData[selector]) {
                        return this.helpData[selector];
                    }
                }
            }
            
            // Check by ID
            if (currentElement.id) {
                const selector = `#${currentElement.id}`;
                if (this.helpData[selector]) {
                    return this.helpData[selector];
                }
            }
            
            currentElement = currentElement.parentElement;
        }
        
        return null;
    }

    showGenericHelp(element) {
        const tagName = element.tagName.toLowerCase();
        const genericHelp = this.getGenericHelpForTag(tagName);
        
        this.showTooltip(element, genericHelp);
        this.speak(genericHelp.voice);
    }

    getGenericHelpForTag(tagName) {
        const genericHelp = {
            'button': {
                title: 'Button',
                content: 'Click this button to perform an action. You may also be able to activate it with voice commands.',
                voice: 'This is a button. Click to perform an action or try using voice commands.'
            },
            'input': {
                title: 'Input Field',
                content: 'Enter text in this field. Look for a microphone button to use voice input.',
                voice: 'This is an input field. Type here or look for voice input options.'
            },
            'select': {
                title: 'Dropdown Menu',
                content: 'Click to open a list of options to choose from.',
                voice: 'This is a dropdown menu. Click to see available options.'
            },
            'a': {
                title: 'Link',
                content: 'Click this link to navigate to another page or section.',
                voice: 'This is a link. Click to navigate to another page or section.'
            },
            'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
                title: 'Heading',
                content: 'This is a section heading that describes the content below.',
                voice: 'This is a section heading describing the content that follows.'
            },
            'h1': {
                title: 'Heading',
                content: 'This is a section heading that describes the content below.',
                voice: 'This is a section heading describing the content that follows.'
            },
            'h2': {
                title: 'Heading',
                content: 'This is a section heading that describes the content below.',
                voice: 'This is a section heading describing the content that follows.'
            },
            'h3': {
                title: 'Heading',
                content: 'This is a section heading that describes the content below.',
                voice: 'This is a section heading describing the content that follows.'
            },
            'h4': {
                title: 'Heading',
                content: 'This is a section heading that describes the content below.',
                voice: 'This is a section heading describing the content that follows.'
            },
            'h5': {
                title: 'Heading',
                content: 'This is a section heading that describes the content below.',
                voice: 'This is a section heading describing the content that follows.'
            },
            'h6': {
                title: 'Heading',
                content: 'This is a section heading that describes the content below.',
                voice: 'This is a section heading describing the content that follows.'
            },
            default: {
                title: 'Interface Element',
                content: 'This is an interactive element. Try clicking or using voice commands to interact with it.',
                voice: 'This is an interface element. Try clicking or using voice commands to interact.'
            }
        };
        
        return genericHelp[tagName] || genericHelp.default;
    }

    showTooltip(element, helpInfo) {
        const tooltip = document.getElementById('helpTooltip');
        const title = document.getElementById('tooltipTitle');
        const content = document.getElementById('tooltipContent');
        
        title.textContent = helpInfo.title;
        content.textContent = helpInfo.content;
        
        this.currentTooltip = helpInfo;
        
        // Position tooltip
        this.positionTooltip(tooltip, element);
        
        // Show tooltip
        tooltip.classList.add('active');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (tooltip.classList.contains('active')) {
                this.hideTooltip();
            }
        }, 10000);
    }

    positionTooltip(tooltip, element) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + 10;
        
        // Adjust horizontal position if tooltip goes off screen
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > viewportWidth - 10) {
            left = viewportWidth - tooltipRect.width - 10;
        }
        
        // Adjust vertical position if tooltip goes off screen
        if (top + tooltipRect.height > viewportHeight - 10) {
            top = rect.top - tooltipRect.height - 10;
            tooltip.classList.add('tooltip-above');
        } else {
            tooltip.classList.remove('tooltip-above');
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    hideTooltip() {
        document.getElementById('helpTooltip').classList.remove('active');
        this.currentTooltip = null;
    }

    speakCurrentTooltip() {
        if (this.currentTooltip) {
            this.speak(this.currentTooltip.voice || this.currentTooltip.content);
        }
    }

    showHelpPanel() {
        document.getElementById('helpPanel').classList.add('active');
    }

    hideHelpPanel() {
        document.getElementById('helpPanel').classList.remove('active');
    }

    explainCurrentScreen() {
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen) {
            const screenId = currentScreen.id;
            const explanations = {
                'welcomeScreen': 'This is the welcome screen where you can register or login to VaaniSewa.',
                'registrationScreen': 'This is the registration screen where new users can create an account.',
                'loginScreen': 'This is the login screen for existing users to access their account.',
                'dashboardScreen': 'This is your main dashboard with navigation options and user information.',
                'settingsScreen': 'This is the settings screen where you can customize voice and display preferences.',
                'helpScreen': 'This is the help screen with voice commands and usage instructions.',
                'adminDashboard': 'This is the admin dashboard for managing users and system settings.',
                'userDashboard': 'This is your personal dashboard for managing profile and preferences.'
            };
            
            const explanation = explanations[screenId] || 'This is the current screen you are viewing.';
            this.speak(explanation);
        }
    }

    showTaskHelp() {
        const taskHelp = `
            Here are common tasks you can perform:
            - Say "register user" to create a new account
            - Say "login" to access your account
            - Say "settings" to customize your preferences
            - Say "volume up" or "volume down" to adjust audio
            - Say "help" anytime for assistance
            - Click the question mark button for contextual help
        `;
        this.speak(taskHelp);
        this.showHelpPanel();
    }

    showDetailedHelp() {
        const detailedHelp = `
            VaaniSewa is a voice-controlled accessibility application. 
            You can navigate entirely using voice commands or traditional clicking. 
            The system supports both English and Hindi languages. 
            Voice feedback is provided for all interactions. 
            Use the help button or say "help" anytime for assistance.
        `;
        this.speak(detailedHelp);
        this.showHelpPanel();
    }

    speak(text) {
        if (this.app && this.app.speak) {
            this.app.speak(text);
        } else if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Add help data for new elements
    addHelpData(selector, helpInfo) {
        this.helpData[selector] = helpInfo;
    }

    // Remove help data
    removeHelpData(selector) {
        delete this.helpData[selector];
    }

    // Update help data
    updateHelpData(selector, helpInfo) {
        if (this.helpData[selector]) {
            this.helpData[selector] = { ...this.helpData[selector], ...helpInfo };
        }
    }
}

// Export for global use
window.ContextualHelp = ContextualHelp;