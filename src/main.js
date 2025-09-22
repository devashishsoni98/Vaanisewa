// VaaniSewa - Main Application Controller
class VaaniSewaApp {
    constructor() {
        // Core properties
        this.currentScreen = 'welcomeScreen';
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLanguage = 'en';
        this.volume = 0.7;
        this.speechRate = 1.0;
        this.speechPitch = 1.0;
        this.selectedVoice = null;
        this.voices = [];
        this.continuousListening = true;
        this.isRecognitionActive = false;
        this.recognitionRestartTimeout = null;
        this.voiceTimeout = null;
        
        // System components
        this.security = null;
        this.auth = null;
        this.dataManager = null;
        this.contextualHelp = null;
        this.onboardingWizard = null;
        this.adminDashboard = null;
        this.userDashboard = null;
        
        // Voice commands mapping
        this.voiceCommands = {
            en: {
                // Authentication commands
                'register user': () => this.showScreen('registrationScreen'),
                'register': () => this.showScreen('registrationScreen'),
                'login': () => this.showScreen('loginScreen'),
                'log in': () => this.showScreen('loginScreen'),
                'logout': () => this.logout(),
                'log out': () => this.logout(),
                
                // Navigation commands
                'home': () => this.goHome(),
                'dashboard': () => this.goHome(),
                'settings': () => this.showScreen('settingsScreen'),
                'help': () => this.showScreen('helpScreen'),
                'back': () => this.goBack(),
                
                // Volume commands
                'volume up': () => this.adjustVolume(0.1),
                'volume down': () => this.adjustVolume(-0.1),
                'increase volume': () => this.adjustVolume(0.1),
                'decrease volume': () => this.adjustVolume(-0.1),
                'mute': () => this.setVolume(0),
                'unmute': () => this.setVolume(0.7),
                
                // Language commands
                'change language': () => this.toggleLanguage(),
                'switch language': () => this.toggleLanguage(),
                'english': () => this.setLanguage('en'),
                'hindi': () => this.setLanguage('hi'),
                
                // Help commands
                'help mode': () => this.toggleHelpMode(),
                'what is this': () => this.explainCurrentScreen(),
                'how do i': () => this.showTaskHelp(),
                'explain': () => this.showDetailedHelp(),
                
                // Admin commands (role-based)
                'admin panel': () => this.showAdminDashboard(),
                'user management': () => this.showUserManagement(),
                'system settings': () => this.showSystemSettings(),
                
                // Accessibility commands
                'high contrast': () => this.toggleHighContrast(),
                'large text': () => this.toggleLargeText(),
                'reduce motion': () => this.toggleReducedMotion(),
                
                // Form commands
                'submit': () => this.submitCurrentForm(),
                'cancel': () => this.cancelCurrentAction(),
                'clear form': () => this.clearCurrentForm(),
                
                // General commands
                'repeat': () => this.repeatLastMessage(),
                'stop': () => this.stopSpeaking(),
                'pause': () => this.pauseSpeaking(),
                'resume': () => this.resumeSpeaking()
            },
            hi: {
                // Authentication commands (Hindi)
                'उपयोगकर्ता पंजीकरण': () => this.showScreen('registrationScreen'),
                'पंजीकरण': () => this.showScreen('registrationScreen'),
                'लॉगिन करें': () => this.showScreen('loginScreen'),
                'लॉगिन': () => this.showScreen('loginScreen'),
                'लॉगआउट': () => this.logout(),
                
                // Navigation commands (Hindi)
                'होम': () => this.goHome(),
                'डैशबोर्ड': () => this.goHome(),
                'सेटिंग्स': () => this.showScreen('settingsScreen'),
                'सहायता': () => this.showScreen('helpScreen'),
                'वापस': () => this.goBack(),
                
                // Volume commands (Hindi)
                'आवाज़ बढ़ाएं': () => this.adjustVolume(0.1),
                'आवाज़ कम करें': () => this.adjustVolume(-0.1),
                'आवाज़ तेज़ करें': () => this.adjustVolume(0.1),
                'आवाज़ धीमी करें': () => this.adjustVolume(-0.1),
                'मूक': () => this.setVolume(0),
                'अमूक': () => this.setVolume(0.7),
                
                // Language commands (Hindi)
                'भाषा बदलें': () => this.toggleLanguage(),
                'भाषा स्विच करें': () => this.toggleLanguage(),
                'अंग्रेजी': () => this.setLanguage('en'),
                'हिंदी': () => this.setLanguage('hi'),
                
                // Help commands (Hindi)
                'सहायता मोड': () => this.toggleHelpMode(),
                'यह क्या है': () => this.explainCurrentScreen(),
                'मैं कैसे करूं': () => this.showTaskHelp(),
                'समझाएं': () => this.showDetailedHelp(),
                
                // Admin commands (Hindi)
                'एडमिन पैनल': () => this.showAdminDashboard(),
                'उपयोगकर्ता प्रबंधन': () => this.showUserManagement(),
                'सिस्टम सेटिंग्स': () => this.showSystemSettings(),
                
                // Accessibility commands (Hindi)
                'उच्च कंट्रास्ट': () => this.toggleHighContrast(),
                'बड़ा टेक्स्ट': () => this.toggleLargeText(),
                'गति कम करें': () => this.toggleReducedMotion(),
                
                // Form commands (Hindi)
                'सबमिट करें': () => this.submitCurrentForm(),
                'रद्द करें': () => this.cancelCurrentAction(),
                'फॉर्म साफ़ करें': () => this.clearCurrentForm(),
                
                // General commands (Hindi)
                'दोहराएं': () => this.repeatLastMessage(),
                'रोकें': () => this.stopSpeaking(),
                'रुकें': () => this.pauseSpeaking(),
                'जारी रखें': () => this.resumeSpeaking()
            }
        };
        
        // UI text translations
        this.translations = {
            en: {
                welcomeTitle: 'Welcome to VaaniSewa',
                welcomeSubtitle: 'Voice-powered accessibility for everyone',
                registerBtnText: 'Register',
                loginBtnText: 'Login',
                voiceCommandsText: 'Voice Commands:',
                registrationTitle: 'Voice Registration',
                loginTitle: 'Voice Login',
                dashboardTitle: 'Dashboard',
                settingsTitle: 'Settings',
                helpTitle: 'Help & Voice Commands',
                currentLang: 'EN',
                statusReady: 'Ready to listen',
                statusListening: 'Listening...',
                statusProcessing: 'Processing...',
                commandsHint: 'Say: "register user", "login", "home", "settings", "help"'
            },
            hi: {
                welcomeTitle: 'VaaniSewa में आपका स्वागत है',
                welcomeSubtitle: 'सभी के लिए आवाज़-संचालित पहुंच',
                registerBtnText: 'पंजीकरण',
                loginBtnText: 'लॉगिन',
                voiceCommandsText: 'आवाज़ कमांड:',
                registrationTitle: 'आवाज़ पंजीकरण',
                loginTitle: 'आवाज़ लॉगिन',
                dashboardTitle: 'डैशबोर्ड',
                settingsTitle: 'सेटिंग्स',
                helpTitle: 'सहायता और आवाज़ कमांड',
                currentLang: 'हि',
                statusReady: 'सुनने के लिए तैयार',
                statusListening: 'सुन रहा है...',
                statusProcessing: 'प्रसंस्करण...',
                commandsHint: 'कहें: "उपयोगकर्ता पंजीकरण", "लॉगिन", "होम", "सेटिंग्स", "सहायता"'
            }
        };
        
        this.lastSpokenMessage = '';
        this.screenHistory = [];
        
        // Initialize the application
        this.init();
    }
    
    async init() {
        try {
            // Initialize security first
            this.security = window.SecurityManager ? new SecurityManager() : null;
            
            // Initialize authentication system
            this.auth = window.AuthSystem ? new AuthSystem() : this.createMockAuth();
            
            // Initialize data manager
            this.dataManager = window.DataManager ? new DataManager(this.auth) : null;
            
            // Set up voice recognition
            await this.initializeVoiceRecognition();
            
            // Set up speech synthesis
            this.initializeSpeechSynthesis();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            // Initialize contextual help
            this.contextualHelp = window.ContextualHelp ? new ContextualHelp(this) : null;
            
            // Check if user needs onboarding
            if (window.OnboardingWizard && OnboardingWizard.shouldShowOnboarding()) {
                this.onboardingWizard = new OnboardingWizard(this);
                setTimeout(() => {
                    this.onboardingWizard.start();
                }, 1000);
            }
            
            // Check for existing session
            this.checkExistingSession();
            
            // Start listening for voice commands
            this.startListening();
            
            // Announce ready state
            this.speak('VaaniSewa is ready. Say "help" for available commands.');
            
            console.log('VaaniSewa initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize VaaniSewa:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    createMockAuth() {
        return {
            currentUser: null,
            login: (username) => {
                this.currentUser = { username, role: 'student', id: Date.now().toString() };
                return { success: true, user: this.currentUser };
            },
            logout: () => {
                this.currentUser = null;
                return { success: true };
            },
            getUsers: () => [],
            updateUser: () => {},
            logActivity: () => {},
            getActivities: () => [],
            loadSession: () => null,
            updateLastActivity: () => {}
        };
    }
    
    async initializeVoiceRecognition() {
        // Clear any existing recognition
        if (this.recognition) {
            this.recognition.abort();
            this.recognition = null;
        }
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            this.showError('Voice recognition is not supported in this browser. Please use Chrome or Edge for the best experience.');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        this.recognition.maxAlternatives = 3;
        
        this.recognition.onstart = () => {
            this.isRecognitionActive = true;
            this.isListening = true;
            this.updateListeningStatus();
            console.log('Voice recognition started');
        };
        
        this.recognition.onresult = (event) => {
            const results = Array.from(event.results);
            const lastResult = results[results.length - 1];
            
            if (lastResult.isFinal) {
                const transcript = lastResult[0].transcript.trim().toLowerCase();
                console.log('Voice command received:', transcript);
                this.processVoiceCommand(transcript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isRecognitionActive = false;
            this.isListening = false;
            
            if (event.error === 'not-allowed') {
                this.showError('Microphone access denied. Please allow microphone access and refresh the page.');
            } else if (event.error === 'no-speech') {
                // Restart listening if no speech detected
                if (this.continuousListening) {
                    setTimeout(() => this.startListening(), 1000);
                }
            } else if (event.error === 'aborted') {
                // Handle aborted error gracefully - don't restart immediately
                console.log('Speech recognition was aborted');
            } else {
                console.warn(`Voice recognition error: ${event.error}`);
                // Try to restart after a longer delay for other errors
                if (this.continuousListening) {
                    setTimeout(() => this.startListening(), 2000);
                }
            }
            
            this.updateListeningStatus();
        };
        
        this.recognition.onend = () => {
            this.isRecognitionActive = false;
            this.isListening = false;
            this.updateListeningStatus();
            
            // Restart listening if continuous mode is enabled
            if (this.continuousListening) {
                setTimeout(() => this.startListening(), 500);
            }
        };
        
        // Add abort handler
        this.recognition.onabort = () => {
            this.isRecognitionActive = false;
            this.isListening = false;
        };
    }
    
    initializeSpeechSynthesis() {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        // Load available voices
        this.loadVoices();
        
        // Reload voices when they change (some browsers load voices asynchronously)
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }
    
    loadVoices() {
        this.voices = this.synthesis.getVoices();
        
        // Update voice select elements
        const voiceSelects = document.querySelectorAll('#voiceSelect, #userVoiceSelect');
        voiceSelects.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Default Voice</option>';
                this.voices.forEach(voice => {
                    const option = document.createElement('option');
                    option.value = voice.name;
                    option.textContent = `${voice.name} (${voice.lang})`;
                    select.appendChild(option);
                });
            }
        });
    }
    
    setupEventListeners() {
        // Language toggle
        document.getElementById('languageToggle')?.addEventListener('click', () => {
            this.toggleLanguage();
        });
        
        // Volume controls
        document.getElementById('volumeUp')?.addEventListener('click', () => {
            this.adjustVolume(0.1);
        });
        
        document.getElementById('volumeDown')?.addEventListener('click', () => {
            this.adjustVolume(-0.1);
        });
        
        // Main navigation buttons
        document.getElementById('registerBtn')?.addEventListener('click', () => {
            this.showScreen('registrationScreen');
        });
        
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.showScreen('loginScreen');
        });
        
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            this.showScreen('settingsScreen');
        });
        
        document.getElementById('helpBtn')?.addEventListener('click', () => {
            this.showScreen('helpScreen');
        });
        
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
        
        // Back buttons
        document.getElementById('cancelRegBtn')?.addEventListener('click', () => {
            this.showScreen('welcomeScreen');
        });
        
        document.getElementById('cancelLoginBtn')?.addEventListener('click', () => {
            this.showScreen('welcomeScreen');
        });
        
        document.getElementById('backToDashboardBtn')?.addEventListener('click', () => {
            this.goHome();
        });
        
        document.getElementById('backFromHelpBtn')?.addEventListener('click', () => {
            this.goBack();
        });
        
        // Form submissions
        document.getElementById('registrationForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });
        
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Voice input buttons
        document.querySelectorAll('.mic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.target.closest('.mic-btn').dataset.field;
                this.handleVoiceInput(field);
            });
        });
        
        // Settings controls
        document.getElementById('speechRate')?.addEventListener('input', (e) => {
            this.speechRate = parseFloat(e.target.value);
            document.getElementById('speechRateValue').textContent = this.speechRate.toFixed(1);
        });
        
        document.getElementById('speechPitch')?.addEventListener('input', (e) => {
            this.speechPitch = parseFloat(e.target.value);
            document.getElementById('speechPitchValue').textContent = this.speechPitch.toFixed(1);
        });
        
        document.getElementById('voiceSelect')?.addEventListener('change', (e) => {
            this.selectedVoice = e.target.value;
        });
        
        document.getElementById('testVoiceBtn')?.addEventListener('click', () => {
            this.speak('This is a test of your voice settings.');
        });
        
        // Session expiration handler
        window.addEventListener('sessionExpired', () => {
            this.handleSessionExpired();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Click tracking for activity
        document.addEventListener('click', () => {
            if (this.auth && this.auth.currentUser) {
                this.auth.updateLastActivity();
            }
        });
    }
    
    initializeUI() {
        // Set initial language
        this.updateLanguage();
        
        // Update volume indicator
        this.updateVolumeIndicator();
        
        // Initialize listening status
        this.updateListeningStatus();
        
        // Load user preferences if logged in
        if (this.auth && this.auth.currentUser && this.auth.currentUser.preferences) {
            this.applyUserPreferences(this.auth.currentUser.preferences);
        }
    }
    
    checkExistingSession() {
        const session = this.auth && this.auth.loadSession ? this.auth.loadSession() : null;
        if (session && session.user) {
            this.handleSuccessfulLogin(session.user);
        }
    }
    
    // Voice Recognition Methods
    startListening() {
        // Clear any pending restart timeout
        if (this.recognitionRestartTimeout) {
            clearTimeout(this.recognitionRestartTimeout);
            this.recognitionRestartTimeout = null;
        }
        
        if (!this.recognition) {
            console.warn('Speech recognition not initialized');
            return;
        }
        
        if (this.isRecognitionActive || this.isListening) {
            console.log('Speech recognition already active');
            return;
        }
        
        try {
            this.recognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
            this.recognition.start();
            console.log('Starting speech recognition...');
        } catch (error) {
            console.error('Failed to start voice recognition:', error);
            this.isRecognitionActive = false;
            this.isListening = false;
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        // Clear any pending restart timeout
        if (this.recognitionRestartTimeout) {
            clearTimeout(this.recognitionRestartTimeout);
            this.recognitionRestartTimeout = null;
        }
    }
    
    processVoiceCommand(transcript) {
        const commands = this.voiceCommands[this.currentLanguage];
        const command = transcript.toLowerCase().trim();
        
        // Log voice command activity
        if (this.auth && this.auth.currentUser) {
            this.auth.logActivity('voice_command', { command, language: this.currentLanguage });
        }
        
        // Find matching command
        let commandFound = false;
        for (const [key, action] of Object.entries(commands)) {
            if (command.includes(key.toLowerCase()) || key.toLowerCase().includes(command)) {
                try {
                    action();
                    commandFound = true;
                    this.speak(this.getCommandConfirmation(key));
                    break;
                } catch (error) {
                    console.error('Error executing voice command:', error);
                    this.speak('Sorry, there was an error executing that command.');
                }
            }
        }
        
        if (!commandFound) {
            console.log('Command not recognized:', command);
            this.speak('Command not recognized. Say "help" to see available commands.');
        }
    }
    
    getCommandConfirmation(command) {
        const confirmations = {
            en: {
                'register user': 'Opening registration form',
                'login': 'Opening login form',
                'home': 'Going to dashboard',
                'settings': 'Opening settings',
                'help': 'Opening help',
                'volume up': 'Volume increased',
                'volume down': 'Volume decreased',
                'change language': 'Language changed'
            },
            hi: {
                'उपयोगकर्ता पंजीकरण': 'पंजीकरण फॉर्म खोल रहे हैं',
                'लॉगिन': 'लॉगिन फॉर्म खोल रहे हैं',
                'होम': 'डैशबोर्ड पर जा रहे हैं',
                'सेटिंग्स': 'सेटिंग्स खोल रहे हैं',
                'सहायता': 'सहायता खोल रहे हैं',
                'आवाज़ बढ़ाएं': 'आवाज़ बढ़ाई गई',
                'आवाज़ कम करें': 'आवाज़ कम की गई',
                'भाषा बदलें': 'भाषा बदली गई'
            }
        };
        
        return confirmations[this.currentLanguage][command] || 'Command executed';
    }
    
    // Voice Input for Forms
    handleVoiceInput(fieldName) {
        if (!this.recognition) {
            this.speak('Voice input not available');
            return;
        }
        
        const field = document.getElementById(fieldName) || document.querySelector(`[data-field="${fieldName}"]`);
        if (!field) return;
        
        const micBtn = document.querySelector(`[data-field="${fieldName}"]`);
        if (micBtn) {
            micBtn.classList.add('listening');
        }
        
        // Stop continuous listening temporarily
        const wasListening = this.continuousListening;
        this.continuousListening = false;
        
        // Stop current recognition properly
        if (this.recognition && this.isRecognitionActive) {
            this.recognition.abort();
        }
        
        this.stopListening();
        
        // Create temporary recognition for form input
        const tempRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        tempRecognition.continuous = false;
        tempRecognition.interimResults = false;
        tempRecognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        
        let inputCompleted = false;
        tempRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            
            if (field.tagName === 'SELECT') {
                this.handleSelectVoiceInput(field, transcript);
            } else {
                field.value = transcript;
            }
            
            this.speak('Input recorded');
            inputCompleted = true;
            
            // Restore continuous listening
            this.continuousListening = wasListening;
            if (this.continuousListening) {
                this.recognitionRestartTimeout = setTimeout(() => this.startListening(), 1500);
            }
        };
        
        tempRecognition.onerror = (event) => {
            console.error('Voice input error:', event.error);
            this.speak('Voice input failed. Please try again.');
            
            // Restore continuous listening
            this.continuousListening = wasListening;
            if (this.continuousListening) {
                this.recognitionRestartTimeout = setTimeout(() => this.startListening(), 1500);
            }
        };
        
        tempRecognition.onend = () => {
            if (micBtn) {
                micBtn.classList.remove('listening');
            }
            if (!inputCompleted && this.continuousListening) {
                this.recognitionRestartTimeout = setTimeout(() => this.startListening(), 1500);
            }
        };
        
        this.speak('Please speak your input');
        tempRecognition.start();
    }
    
    handleSelectVoiceInput(selectElement, transcript) {
        const options = Array.from(selectElement.options);
        const lowerTranscript = transcript.toLowerCase();
        
        // Map common voice inputs to select options
        const mappings = {
            'visual': 'visual',
            'hearing': 'hearing',
            'mobility': 'mobility',
            'cognitive': 'cognitive',
            'other': 'other',
            'student': 'student',
            'admin': 'admin',
            'institution admin': 'institution_admin'
        };
        
        const mappedValue = mappings[lowerTranscript];
        if (mappedValue) {
            selectElement.value = mappedValue;
            return;
        }
        
        // Try to find matching option
        const matchingOption = options.find(option => 
            option.textContent.toLowerCase().includes(lowerTranscript) ||
            lowerTranscript.includes(option.textContent.toLowerCase())
        );
        
        if (matchingOption) {
            selectElement.value = matchingOption.value;
        } else {
            this.speak('Option not found. Please try again or use the dropdown.');
        }
    }
    
    // Speech Synthesis Methods
    speak(text, options = {}) {
        if (!this.synthesis || !text) return;
        
        // Stop any current speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || this.speechRate;
        utterance.pitch = options.pitch || this.speechPitch;
        utterance.volume = options.volume || this.volume;
        utterance.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        
        // Set voice if selected
        if (this.selectedVoice) {
            const voice = this.voices.find(v => v.name === this.selectedVoice);
            if (voice) utterance.voice = voice;
        }
        
        utterance.onend = () => {
            console.log('Speech ended');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
        };
        
        this.synthesis.speak(utterance);
        this.lastSpokenMessage = text;
    }
    
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
    
    pauseSpeaking() {
        if (this.synthesis) {
            this.synthesis.pause();
        }
    }
    
    resumeSpeaking() {
        if (this.synthesis) {
            this.synthesis.resume();
        }
    }
    
    repeatLastMessage() {
        if (this.lastSpokenMessage) {
            this.speak(this.lastSpokenMessage);
        }
    }
    
    // Screen Management
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.screenHistory.push(this.currentScreen);
            this.currentScreen = screenId;
            
            // Focus first interactive element
            const firstInput = targetScreen.querySelector('input, button, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
            
            // Announce screen change
            this.announceScreenChange(screenId);
        }
    }
    
    announceScreenChange(screenId) {
        const announcements = {
            en: {
                'welcomeScreen': 'Welcome screen. You can register or login.',
                'registrationScreen': 'Registration screen. Fill out the form to create an account.',
                'loginScreen': 'Login screen. Enter your username to access your account.',
                'dashboardScreen': 'Dashboard. Your main control panel.',
                'settingsScreen': 'Settings screen. Customize your preferences.',
                'helpScreen': 'Help screen. Voice commands and usage instructions.',
                'adminDashboard': 'Admin dashboard. System management and user administration.',
                'userDashboard': 'User dashboard. Personal profile and activity management.'
            },
            hi: {
                'welcomeScreen': 'स्वागत स्क्रीन। आप पंजीकरण या लॉगिन कर सकते हैं।',
                'registrationScreen': 'पंजीकरण स्क्रीन। खाता बनाने के लिए फॉर्म भरें।',
                'loginScreen': 'लॉगिन स्क्रीन। अपने खाते तक पहुंचने के लिए उपयोगकर्ता नाम दर्ज करें।',
                'dashboardScreen': 'डैशबोर्ड। आपका मुख्य नियंत्रण पैनल।',
                'settingsScreen': 'सेटिंग्स स्क्रीन। अपनी प्राथमिकताएं अनुकूलित करें।',
                'helpScreen': 'सहायता स्क्रीन। आवाज़ कमांड और उपयोग निर्देश।',
                'adminDashboard': 'एडमिन डैशबोर्ड। सिस्टम प्रबंधन और उपयोगकर्ता प्रशासन।',
                'userDashboard': 'उपयोगकर्ता डैशबोर्ड। व्यक्तिगत प्रोफ़ाइल और गतिविधि प्रबंधन।'
            }
        };
        
        const announcement = announcements[this.currentLanguage][screenId];
        if (announcement) {
            setTimeout(() => this.speak(announcement), 500);
        }
    }
    
    goHome() {
        if (this.auth && this.auth.currentUser) {
            const role = this.auth.currentUser.role;
            if (role === 'admin' || role === 'institution_admin') {
                this.showAdminDashboard();
            } else {
                this.showUserDashboard();
            }
        } else {
            this.showScreen('welcomeScreen');
        }
    }
    
    goBack() {
        if (this.screenHistory.length > 0) {
            const previousScreen = this.screenHistory.pop();
            this.showScreen(previousScreen);
        } else {
            this.goHome();
        }
    }
    
    // Authentication Methods
    async handleRegistration() {
        const form = document.getElementById('registrationForm');
        const formData = new FormData(form);
        
        const username = this.security ? this.security.sanitizeInput(formData.get('username')) : formData.get('username');
        const email = this.security ? this.security.sanitizeInput(formData.get('email')) : formData.get('email');
        const disability = formData.get('disability');
        
        // Validate inputs
        const usernameValidation = this.security ? this.security.validateUsername(username) : { isValid: true, value: username };
        const emailValidation = this.security ? this.security.validateEmail(email) : { isValid: true, value: email };
        
        if (!usernameValidation.isValid) {
            this.speak(usernameValidation.error);
            return;
        }
        
        if (!emailValidation.isValid) {
            this.speak(emailValidation.error);
            return;
        }
        
        if (!disability) {
            this.speak('Please select a disability type');
            return;
        }
        
        // Check if user already exists
        const existingUsers = this.auth ? this.auth.getUsers() : [];
        if (existingUsers.find(u => u.username === username)) {
            this.speak('Username already exists. Please choose a different username.');
            return;
        }
        
        if (existingUsers.find(u => u.email === email)) {
            this.speak('Email already registered. Please use a different email.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username: usernameValidation.value,
            email: emailValidation.value,
            role: 'student',
            disability,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            preferences: {
                language: this.currentLanguage,
                speechRate: this.speechRate,
                speechPitch: this.speechPitch,
                volume: this.volume,
                selectedVoice: this.selectedVoice,
                highContrast: false,
                reducedMotion: false,
                largeText: false,
                voiceConfirmation: true,
                continuousListening: true
            }
        };
        
        // Save user
        if (this.auth && this.auth.getUsers) {
            existingUsers.push(newUser);
            localStorage.setItem('vaanisewa-users', JSON.stringify(existingUsers));
        }
        
        // Log activity
        if (this.auth && this.auth.logActivity) {
            this.auth.logActivity('user_registered', { 
            username: newUser.username, 
            email: newUser.email,
            disability: newUser.disability 
            });
        }
        
        this.speak('Registration successful! You can now login with your username.');
        form.reset();
        setTimeout(() => this.showScreen('loginScreen'), 2000);
    }
    
    async handleLogin() {
        const form = document.getElementById('loginForm');
        const formData = new FormData(form);
        const username = this.security ? this.security.sanitizeInput(formData.get('username')) : formData.get('username');
        
        if (!username) {
            this.speak('Please enter your username');
            return;
        }
        
        // Check account lockout
        const lockStatus = this.security ? this.security.isAccountLocked(username) : { isLocked: false };
        if (lockStatus.isLocked) {
            const remainingTime = Math.ceil(lockStatus.remainingTime / 60000);
            this.speak(`Account is locked. Please try again in ${remainingTime} minutes.`);
            return;
        }
        
        // Attempt login
        const result = this.auth.login(username);
        
        // Track login attempt
        if (this.security) this.security.trackLoginAttempt(username, result.success);
        
        if (result.success) {
            this.handleSuccessfulLogin(result.user);
        } else {
            this.speak('Login failed. Please check your username and try again.');
        }
    }
    
    handleSuccessfulLogin(user) {
        this.speak(`Welcome back, ${user.username}!`);
        
        // Apply user preferences
        if (user.preferences) {
            this.applyUserPreferences(user.preferences);
        }
        
        // Initialize role-specific dashboards
        if (user.role === 'admin' || user.role === 'institution_admin') {
            this.adminDashboard = window.AdminDashboard ? new AdminDashboard(this.auth) : null;
            this.showAdminDashboard();
        } else {
            this.userDashboard = window.UserDashboard ? new UserDashboard(this.auth) : null;
            this.showUserDashboard();
        }
        
        // Update UI for logged-in state
        this.updateUserInfo(user);
    }
    
    logout() {
        if (this.auth && this.auth.currentUser) {
            const username = this.auth.currentUser.username;
            this.auth.logout();
            this.speak(`Goodbye, ${username}!`);
            
            // Reset dashboards
            this.adminDashboard = null;
            this.userDashboard = null;
            
            // Return to welcome screen
            this.showScreen('welcomeScreen');
            
            // Reset preferences to defaults
            this.resetToDefaults();
        }
    }
    
    // Cleanup method
    cleanup() {
        if (this.recognition) {
            this.recognition.abort();
        }
        if (this.recognitionRestartTimeout) {
            clearTimeout(this.recognitionRestartTimeout);
        }
    }
    
    handleSessionExpired() {
        this.speak('Your session has expired. Please login again.');
        this.logout();
    }
    
    // Dashboard Methods
    showAdminDashboard() {
        if (!this.adminDashboard) {
            this.adminDashboard = window.AdminDashboard ? new AdminDashboard(this.auth) : null;
        }
        this.showScreen('adminDashboard');
    }
    
    showUserDashboard() {
        if (!this.userDashboard) {
            this.userDashboard = window.UserDashboard ? new UserDashboard(this.auth) : null;
        }
        this.showScreen('userDashboard');
    }
    
    showUserManagement() {
        if (this.adminDashboard) {
            this.adminDashboard.switchView('users');
        }
        this.showAdminDashboard();
    }
    
    showSystemSettings() {
        if (this.adminDashboard) {
            this.adminDashboard.switchView('system');
        }
        this.showAdminDashboard();
    }
    
    // Language Management
    toggleLanguage() {
        this.setLanguage(this.currentLanguage === 'en' ? 'hi' : 'en');
    }
    
    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'hi') return;
        
        this.currentLanguage = lang;
        this.updateLanguage();
        
        // Update voice recognition language
        if (this.recognition) {
            this.recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
        }
        
        // Save preference if user is logged in
        if (this.auth && this.auth.currentUser) {
            const updatedUser = {
                ...this.auth.currentUser,
                preferences: {
                    ...this.auth.currentUser.preferences,
                    language: lang
                }
            };
            this.auth.updateUser(updatedUser);
        }
        
        this.speak(lang === 'hi' ? 'भाषा हिंदी में बदल गई' : 'Language changed to English');
    }
    
    updateLanguage() {
        const texts = this.translations[this.currentLanguage];
        
        // Update UI text elements
        Object.keys(texts).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = texts[key];
            }
        });
        
        // Update language indicator
        const langIndicator = document.getElementById('currentLang');
        if (langIndicator) {
            langIndicator.textContent = texts.currentLang;
        }
        
        // Update voice commands hint
        const hintsElement = document.getElementById('commandsHint');
        if (hintsElement) {
            hintsElement.textContent = texts.commandsHint;
        }
    }
    
    // Volume Management
    adjustVolume(delta) {
        this.setVolume(Math.max(0, Math.min(1, this.volume + delta)));
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.updateVolumeIndicator();
        
        // Save preference if user is logged in
        if (this.auth && this.auth.currentUser) {
            const updatedUser = {
                ...this.auth.currentUser,
                preferences: {
                    ...this.auth.currentUser.preferences,
                    volume: this.volume
                }
            };
            this.auth.updateUser(updatedUser);
        }
    }
    
    updateVolumeIndicator() {
        const volumeBar = document.getElementById('volumeBar');
        if (volumeBar) {
            volumeBar.style.width = `${this.volume * 100}%`;
        }
    }
    
    // Accessibility Features
    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        const isEnabled = document.body.classList.contains('high-contrast');
        this.speak(isEnabled ? 'High contrast enabled' : 'High contrast disabled');
        this.saveAccessibilityPreference('highContrast', isEnabled);
    }
    
    toggleLargeText() {
        document.body.classList.toggle('large-text');
        const isEnabled = document.body.classList.contains('large-text');
        this.speak(isEnabled ? 'Large text enabled' : 'Large text disabled');
        this.saveAccessibilityPreference('largeText', isEnabled);
    }
    
    toggleReducedMotion() {
        document.body.classList.toggle('reduced-motion');
        const isEnabled = document.body.classList.contains('reduced-motion');
        this.speak(isEnabled ? 'Reduced motion enabled' : 'Reduced motion disabled');
        this.saveAccessibilityPreference('reducedMotion', isEnabled);
    }
    
    saveAccessibilityPreference(key, value) {
        if (this.auth && this.auth.currentUser) {
            const updatedUser = {
                ...this.auth.currentUser,
                preferences: {
                    ...this.auth.currentUser.preferences,
                    [key]: value
                }
            };
            this.auth.updateUser(updatedUser);
        }
    }
    
    // Help System Integration
    toggleHelpMode() {
        if (this.contextualHelp) {
            this.contextualHelp.toggleHelpMode();
        }
    }
    
    explainCurrentScreen() {
        if (this.contextualHelp) {
            this.contextualHelp.explainCurrentScreen();
        }
    }
    
    showTaskHelp() {
        if (this.contextualHelp) {
            this.contextualHelp.showTaskHelp();
        }
    }
    
    showDetailedHelp() {
        if (this.contextualHelp) {
            this.contextualHelp.showDetailedHelp();
        }
    }
    
    // Form Management
    submitCurrentForm() {
        const activeScreen = document.querySelector('.screen.active');
        const form = activeScreen?.querySelector('form');
        
        if (form) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }
    
    cancelCurrentAction() {
        const activeScreen = document.querySelector('.screen.active');
        const cancelBtn = activeScreen?.querySelector('.btn-secondary, [id*="cancel"]');
        
        if (cancelBtn) {
            cancelBtn.click();
        } else {
            this.goBack();
        }
    }
    
    clearCurrentForm() {
        const activeScreen = document.querySelector('.screen.active');
        const form = activeScreen?.querySelector('form');
        
        if (form) {
            form.reset();
            this.speak('Form cleared');
        }
    }
    
    // Utility Methods
    updateListeningStatus() {
        const statusText = document.getElementById('statusText');
        const micIcon = document.getElementById('micIcon');
        const listeningStatus = document.querySelector('.listening-status');
        
        if (this.isListening) {
            if (statusText) statusText.textContent = this.translations[this.currentLanguage].statusListening;
            if (micIcon) micIcon.className = 'fas fa-microphone';
            if (listeningStatus) listeningStatus.classList.add('active');
        } else {
            if (statusText) statusText.textContent = this.translations[this.currentLanguage].statusReady;
            if (micIcon) micIcon.className = 'fas fa-microphone-slash';
            if (listeningStatus) listeningStatus.classList.remove('active');
        }
    }
    
    updateUserInfo(user) {
        const userWelcome = document.getElementById('userWelcome');
        const userInfo = document.getElementById('userInfo');
        
        if (userWelcome) {
            userWelcome.textContent = `Welcome back, ${user.username}!`;
        }
        
        if (userInfo) {
            userInfo.textContent = `Role: ${user.role} | Disability: ${user.disability}`;
        }
    }
    
    applyUserPreferences(preferences) {
        // Apply voice preferences
        this.speechRate = preferences.speechRate || 1.0;
        this.speechPitch = preferences.speechPitch || 1.0;
        this.volume = preferences.volume || 0.7;
        this.selectedVoice = preferences.selectedVoice || null;
        
        // Apply language preference
        if (preferences.language && preferences.language !== this.currentLanguage) {
            this.setLanguage(preferences.language);
        }
        
        // Apply accessibility preferences
        document.body.classList.toggle('high-contrast', preferences.highContrast || false);
        document.body.classList.toggle('large-text', preferences.largeText || false);
        document.body.classList.toggle('reduced-motion', preferences.reducedMotion || false);
        
        // Apply voice settings
        this.continuousListening = preferences.continuousListening !== false;
        
        // Update UI controls
        this.updateVolumeIndicator();
        if (!document.getElementById('speechRate')) return;
        const speechRateSlider = document.getElementById('speechRate');
        const speechPitchSlider = document.getElementById('speechPitch');
        
        if (speechRateSlider) {
            speechRateSlider.value = this.speechRate;
            document.getElementById('speechRateValue').textContent = this.speechRate.toFixed(1);
        }
        
        if (speechPitchSlider) {
            speechPitchSlider.value = this.speechPitch;
            document.getElementById('speechPitchValue').textContent = this.speechPitch.toFixed(1);
        }
    }
    
    resetToDefaults() {
        this.speechRate = 1.0;
        this.speechPitch = 1.0;
        this.volume = 0.7;
        this.selectedVoice = null;
        this.currentLanguage = 'en';
        this.continuousListening = true;
        
        // Remove accessibility classes
        document.body.classList.remove('high-contrast', 'large-text', 'reduced-motion');
        
        // Update UI
        this.updateLanguage();
        this.updateVolumeIndicator();
    }
    
    handleKeyboardShortcuts(event) {
        // Only handle shortcuts if not typing in an input
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'F1':
                event.preventDefault();
                if (this.contextualHelp) this.contextualHelp.toggleHelpMode();
                break;
            case 'Escape':
                if (this.contextualHelp && this.contextualHelp.isActive) {
                    if (this.contextualHelp.exitHelpMode) this.contextualHelp.exitHelpMode();
                } else {
                    this.goBack();
                }
                break;
            case 'h':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.showScreen('helpScreen');
                }
                break;
            case 's':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.showScreen('settingsScreen');
                }
                break;
        }
    }
    
    showError(message) {
        console.error(message);
        this.speak(message);
        
        // Show visual error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e53e3e;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    showSuccess(message) {
        console.log(message);
        this.speak(message);
        
        // Show visual success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #38a169;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 1000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vaaniSewaApp = new VaaniSewaApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.vaaniSewaApp) {
        window.vaaniSewaApp.cleanup();
    }
});

// Export for global access
window.VaaniSewaApp = VaaniSewaApp;