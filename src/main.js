// VaaniSewa - Voice Accessibility Web Application
class VaaniSewaApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentLanguage = 'en';
        this.volume = 0.7;
        this.speechRate = 1.0;
        this.speechPitch = 1.0;
        this.selectedVoice = null;
        this.continuousListening = false;
        this.recognitionTimeout = null;
        this.restartTimeout = null;
        this.isRecognitionActive = false;
        this.currentUser = null;
        this.authSystem = null;
        this.userDashboard = null;
        
        // Translation object
        this.translations = {
            en: {
                welcome: "Welcome to VaaniSewa",
                subtitle: "Voice-powered accessibility for everyone",
                register: "Register",
                login: "Login",
                voiceCommands: "Voice Commands:",
                registerCommand: '"register" - Start registration',
                loginCommand: '"login" - Start login process',
                helpCommand: '"help" - Get assistance',
                voiceRegistration: "Voice Registration",
                username: "Username:",
                email: "Email:",
                disabilityType: "Disability Type:",
                submit: "Register",
                cancel: "Cancel",
                voiceLogin: "Voice Login",
                dashboard: "Dashboard",
                welcome_back: "Welcome back!",
                settings: "Settings",
                help: "Help",
                logout: "Logout",
                voiceSettings: "Voice Settings",
                speechRate: "Speech Rate:",
                speechPitch: "Speech Pitch:",
                voice: "Voice:",
                testVoice: "Test Voice",
                backToDashboard: "Back to Dashboard",
                helpTitle: "Help & Voice Commands",
                navigationCommands: "Navigation Commands",
                volumeCommands: "Volume Commands",
                authCommands: "Authentication Commands",
                back: "Back",
                readyToListen: "Ready to listen",
                clickToStart: "Click to start listening",
                listening: "Listening...",
                processing: "Processing voice command...",
                commandsHint: 'Try: "register", "login", "help", "home" or click below'
            },
            hi: {
                welcome: "VaaniSewa में आपका स्वागत है",
                subtitle: "सभी के लिए आवाज-संचालित पहुंच",
                register: "पंजीकरण",
                login: "लॉगिन",
                voiceCommands: "आवाज कमांड:",
                registerCommand: '"पंजीकरण" - पंजीकरण शुरू करें',
                loginCommand: '"लॉगिन" - लॉगिन प्रक्रिया शुरू करें',
                helpCommand: '"सहायता" - सहायता प्राप्त करें',
                voiceRegistration: "आवाज पंजीकरण",
                username: "उपयोगकर्ता नाम:",
                email: "ईमेल:",
                disabilityType: "विकलांगता प्रकार:",
                submit: "पंजीकरण करें",
                cancel: "रद्द करें",
                voiceLogin: "आवाज लॉगिन",
                dashboard: "डैशबोर्ड",
                welcome_back: "वापसी पर स्वागत!",
                settings: "सेटिंग्स",
                help: "सहायता",
                logout: "लॉगआउट",
                voiceSettings: "आवाज सेटिंग्स",
                speechRate: "बोलने की गति:",
                speechPitch: "आवाज की ऊंचाई:",
                voice: "आवाज:",
                testVoice: "आवाज परखें",
                backToDashboard: "डैशबोर्ड पर वापस",
                helpTitle: "सहायता और आवाज कमांड",
                navigationCommands: "नेवीगेशन कमांड",
                volumeCommands: "वॉल्यूम कमांड",
                authCommands: "प्रमाणीकरण कमांड",
                back: "वापस",
                readyToListen: "सुनने के लिए तैयार",
                clickToStart: "सुनना शुरू करने के लिए क्लिक करें",
                listening: "सुन रहा है...",
                processing: "आवाज कमांड प्रोसेस कर रहा है...",
                commandsHint: 'कहें: "पंजीकरण", "लॉगिन", "सहायता", "होम" या नीचे क्लिक करें'
            }
        };

        this.init();
    }

    async init() {
        console.log('Initializing VaaniSewa App...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }

    async setupApp() {
        try {
            // Setup event listeners first
            this.setupEventListeners();
            
            // Initialize auth system
            this.authSystem = new AuthSystem();
            
            // Load voices
            await this.loadVoices();
            
            // Update UI with current language
            this.updateLanguage();
            
            // Initialize voice recognition
            this.initializeVoiceRecognition();
            
            // Check if user is already logged in
            this.checkExistingSession();
            
            console.log('VaaniSewa App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    }

    checkExistingSession() {
        const session = this.authSystem.loadSession();
        if (session && session.user) {
            this.currentUser = session.user;
            this.showUserAnalytics();
        }
    }

    async loadVoices() {
        return new Promise((resolve) => {
            const loadVoicesImpl = () => {
                this.voices = this.synthesis.getVoices();
                if (this.voices.length > 0) {
                    console.log('Voices loaded:', this.voices.length);
                    this.populateVoiceSelect();
                    resolve();
                } else {
                    setTimeout(loadVoicesImpl, 100);
                }
            };

            if (this.synthesis.onvoiceschanged !== undefined) {
                this.synthesis.onvoiceschanged = loadVoicesImpl;
            }
            
            loadVoicesImpl();
        });
    }

    populateVoiceSelect() {
        const voiceSelect = document.getElementById('voiceSelect');
        if (!voiceSelect) return;

        voiceSelect.innerHTML = '<option value="">Default Voice</option>';
        
        this.voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    initializeVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            this.updateStatus('Speech recognition not supported in this browser', false);
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configuration
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.currentLanguage === 'en' ? 'en-US' : 'hi-IN';

            // Event handlers
            this.recognition.onstart = () => {
                console.log('Voice recognition started');
                this.isRecognitionActive = true;
                this.isListening = true;
                this.updateStatus(this.t('listening'), true);
            };

            this.recognition.onresult = (event) => {
                const lastResult = event.results[event.results.length - 1];
                if (lastResult.isFinal) {
                    const transcript = lastResult[0].transcript.trim().toLowerCase();
                    console.log('Voice command:', transcript);
                    this.processVoiceCommand(transcript);
                }
            };

            this.recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
                this.isRecognitionActive = false;
                this.isListening = false;
                
                // Don't restart on certain errors
                if (['not-allowed', 'audio-capture'].includes(event.error)) {
                    this.updateStatus('Microphone access denied', false);
                    return;
                }
                
                this.updateStatus('Voice recognition error', false);
            };

            this.recognition.onend = () => {
                console.log('Voice recognition ended');
                this.isRecognitionActive = false;
                this.isListening = false;
                this.updateStatus('Click to start listening', false);
            };

            // Initial status
            this.updateStatus('Click to start listening', false);
            
        } catch (error) {
            console.error('Error initializing voice recognition:', error);
            this.updateStatus('Voice recognition initialization failed', false);
        }
    }

    startListening() {
        if (!this.recognition || this.isRecognitionActive) {
            return;
        }

        try {
            this.recognition.lang = this.currentLanguage === 'en' ? 'en-US' : 'hi-IN';
            this.recognition.start();
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.updateStatus('Error starting voice recognition', false);
        }
    }

    stopListening() {
        if (this.recognition && this.isRecognitionActive) {
            this.recognition.stop();
        }
    }

    processVoiceCommand(command) {
        console.log('Processing voice command:', command);
        
        // Basic command mappings
        const commands = {
            // English commands
            'register': () => this.showScreen('registration'),
            'registration': () => this.showScreen('registration'),
            'sign up': () => this.showScreen('registration'),
            
            'login': () => this.showScreen('login'),
            'log in': () => this.showScreen('login'),
            'sign in': () => this.showScreen('login'),
            
            'home': () => this.showScreen('dashboard'),
            'dashboard': () => this.showScreen('dashboard'),
            'analytics': () => this.showUserAnalytics(),
            
            'help': () => this.showScreen('help'),
            
            'logout': () => this.logout(),
            'log out': () => this.logout(),
            'sign out': () => this.logout(),
            
            'settings': () => this.showScreen('settings'),
            
            'volume up': () => this.adjustVolume(0.1),
            'volume down': () => this.adjustVolume(-0.1),
            
            // Hindi commands
            'पंजीकरण': () => this.showScreen('registration'),
            'रजिस्टर': () => this.showScreen('registration'),
            
            'लॉगिन': () => this.showScreen('login'),
            
            'होम': () => this.showScreen('dashboard'),
            'डैशबोर्ड': () => this.showScreen('dashboard'),
            
            'सहायता': () => this.showScreen('help'),
            'मदद': () => this.showScreen('help'),
            
            'लॉगआउट': () => this.logout(),
            
            'सेटिंग्स': () => this.showScreen('settings'),
            
            'आवाज़ बढ़ाएं': () => this.adjustVolume(0.1),
            'आवाज़ कम करें': () => this.adjustVolume(-0.1),
        };

        // Find matching command
        let commandFound = null;
        for (const cmd in commands) {
            if (command.includes(cmd.toLowerCase())) {
                commandFound = cmd;
                break;
            }
        }

        if (commandFound && commands[commandFound]) {
            console.log('Executing command:', commandFound);
            try {
                commands[commandFound]();
                this.speak(`Command executed: ${commandFound}`);
                
                // Log activity if user is logged in
                if (this.currentUser && this.authSystem) {
                    this.authSystem.logActivity('voice_command', { command: commandFound });
                }
            } catch (error) {
                console.error('Error executing command:', error);
                this.speak('Error executing command');
            }
        } else {
            console.log('Command not recognized:', command);
            this.speak('Command not recognized. Try saying register, login, home, or help.');
        }
    }

    speak(text, options = {}) {
        if (!text) return;

        // Stop any current speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.rate = options.rate || this.speechRate;
        utterance.pitch = options.pitch || this.speechPitch;
        utterance.volume = options.volume || this.volume;
        
        // Set voice
        if (this.selectedVoice && this.voices[this.selectedVoice]) {
            utterance.voice = this.voices[this.selectedVoice];
        }

        try {
            this.synthesis.speak(utterance);
        } catch (error) {
            console.error('Error in speech synthesis:', error);
        }
    }

    updateStatus(text, isListening) {
        const statusText = document.getElementById('statusText');
        const micIcon = document.getElementById('micIcon');
        const listeningStatus = document.querySelector('.listening-status');
        
        if (statusText) {
            statusText.textContent = text;
        }
        
        if (micIcon && listeningStatus) {
            if (isListening) {
                micIcon.className = 'fas fa-microphone';
                listeningStatus.classList.add('active');
            } else {
                micIcon.className = 'fas fa-microphone-slash';
                listeningStatus.classList.remove('active');
            }
        }
    }

    setupEventListeners() {
        // Language toggle
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }

        // Volume controls
        const volumeUp = document.getElementById('volumeUp');
        const volumeDown = document.getElementById('volumeDown');
        
        if (volumeUp) {
            volumeUp.addEventListener('click', () => this.adjustVolume(0.1));
        }
        
        if (volumeDown) {
            volumeDown.addEventListener('click', () => this.adjustVolume(-0.1));
        }

        // Navigation buttons
        const registerBtn = document.getElementById('registerBtn');
        const loginBtn = document.getElementById('loginBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const helpBtn = document.getElementById('helpBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                console.log('Register button clicked');
                this.showScreen('registration');
            });
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('Login button clicked');
                this.showScreen('login');
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('Settings button clicked');
                this.showScreen('settings');
            });
        }
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                console.log('Help button clicked');
                this.showScreen('help');
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('Logout button clicked');
                this.logout();
            });
        }

        // Back buttons
        const backToDashboardBtn = document.getElementById('backToDashboardBtn');
        const backFromHelpBtn = document.getElementById('backFromHelpBtn');
        const cancelRegBtn = document.getElementById('cancelRegBtn');
        const cancelLoginBtn = document.getElementById('cancelLoginBtn');

        if (backToDashboardBtn) {
            backToDashboardBtn.addEventListener('click', () => {
                console.log('Back to dashboard clicked');
                if (this.currentUser) {
                    this.showUserAnalytics();
                } else {
                    this.showScreen('dashboard');
                }
            });
        }
        
        if (backFromHelpBtn) {
            backFromHelpBtn.addEventListener('click', () => {
                console.log('Back from help clicked');
                if (this.currentUser) {
                    this.showUserAnalytics();
                } else {
                    this.showScreen('welcome');
                }
            });
        }
        
        if (cancelRegBtn) {
            cancelRegBtn.addEventListener('click', () => {
                console.log('Cancel registration clicked');
                this.showScreen('welcome');
            });
        }
        
        if (cancelLoginBtn) {
            cancelLoginBtn.addEventListener('click', () => {
                console.log('Cancel login clicked');
                this.showScreen('welcome');
            });
        }

        // Form submissions
        const registrationForm = document.getElementById('registrationForm');
        const loginForm = document.getElementById('loginForm');

        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Registration form submitted');
                this.handleRegistration();
            });
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Login form submitted');
                this.handleLogin();
            });
        }

        // Settings controls
        const speechRate = document.getElementById('speechRate');
        const speechPitch = document.getElementById('speechPitch');
        const voiceSelect = document.getElementById('voiceSelect');
        const testVoiceBtn = document.getElementById('testVoiceBtn');

        if (speechRate) {
            speechRate.addEventListener('input', (e) => {
                this.speechRate = parseFloat(e.target.value);
                const valueSpan = document.getElementById('speechRateValue');
                if (valueSpan) {
                    valueSpan.textContent = this.speechRate.toFixed(1);
                }
            });
        }
        
        if (speechPitch) {
            speechPitch.addEventListener('input', (e) => {
                this.speechPitch = parseFloat(e.target.value);
                const valueSpan = document.getElementById('speechPitchValue');
                if (valueSpan) {
                    valueSpan.textContent = this.speechPitch.toFixed(1);
                }
            });
        }
        
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.selectedVoice = e.target.value ? parseInt(e.target.value) : null;
            });
        }
        
        if (testVoiceBtn) {
            testVoiceBtn.addEventListener('click', () => {
                console.log('Test voice clicked');
                this.speak('This is a test of your voice settings.');
            });
        }

        // Voice control toggle (click on status bar)
        const listeningStatus = document.querySelector('.listening-status');
        if (listeningStatus) {
            listeningStatus.addEventListener('click', () => {
                if (this.isListening) {
                    this.stopListening();
                    this.speak('Voice recognition stopped.');
                } else {
                    this.startListening();
                    this.speak('Voice recognition started. Speak your command.');
                }
            });
        }
        
        // Microphone button for voice input in forms
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mic-btn')) {
                const field = e.target.dataset.field;
                this.handleVoiceInput(field, e.target);
            }
        });
    }
    
    handleVoiceInput(fieldName, button) {
        if (!this.recognition) {
            this.speak('Voice recognition not available');
            return;
        }
        
        button.classList.add('listening');
        this.speak('Speak now');
        
        const tempRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        tempRecognition.continuous = false;
        tempRecognition.interimResults = false;
        tempRecognition.lang = this.currentLanguage === 'en' ? 'en-US' : 'hi-IN';
        
        tempRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const targetInput = document.getElementById(fieldName) || 
                              document.querySelector(`input[data-field="${fieldName}"]`) ||
                              document.querySelector(`select[data-field="${fieldName}"]`);
            
            if (targetInput) {
                if (targetInput.tagName === 'SELECT') {
                    // Handle dropdown selections
                    const options = Array.from(targetInput.options);
                    const matchedOption = options.find(option => 
                        option.text.toLowerCase().includes(transcript.toLowerCase()) ||
                        option.value.toLowerCase().includes(transcript.toLowerCase())
                    );
                    if (matchedOption) {
                        targetInput.value = matchedOption.value;
                    }
                } else {
                    targetInput.value = transcript;
                }
                this.speak(`Entered: ${transcript}`);
            }
            button.classList.remove('listening');
        };
        
        tempRecognition.onerror = () => {
            button.classList.remove('listening');
            this.speak('Voice input failed');
        };
        
        tempRecognition.onend = () => {
            button.classList.remove('listening');
        };
        
        tempRecognition.start();
    }

    handleRegistration() {
        const username = document.getElementById('regUsername')?.value;
        const email = document.getElementById('regEmail')?.value;
        const disability = document.getElementById('regDisability')?.value;

        if (!username || !email || !disability) {
            this.speak('Please fill in all required fields');
            return;
        }

        // Register user through auth system
        console.log('Registration:', { username, email, disability });
        
        const result = this.authSystem.register(username, email, disability);
        if (result.success) {
            this.currentUser = result.user;
            this.speak('Registration successful! Welcome to VaaniSewa.');
            
            setTimeout(() => {
                this.showUserAnalytics();
            }, 2000);
        } else {
            this.speak('Registration failed. Please try again.');
        }
    }

    handleLogin() {
        const username = document.getElementById('loginUsername')?.value;

        if (!username) {
            this.speak('Please enter your username');
            return;
        }

        // Login through auth system
        console.log('Login:', { username });
        
        const result = this.authSystem.login(username);
        if (result.success) {
            this.currentUser = result.user;
            this.speak(`Welcome back, ${username}!`);
            
            setTimeout(() => {
                this.showUserAnalytics();
            }, 2000);
        } else {
            this.speak('Login failed. Please check your username.');
        }
    }
    
    showUserAnalytics() {
        if (!this.currentUser) {
            this.showScreen('welcome');
            return;
        }
        
        // Initialize user dashboard if not already done
        if (!this.userDashboard) {
            this.userDashboard = new UserDashboard(this.authSystem);
        }
        
        // Show user dashboard
        this.showScreen('userDashboard');
        this.speak('Analytics dashboard loaded');
    }

    showScreen(screenName) {
        console.log('Navigating to screen:', screenName);
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const targetScreen = document.getElementById(`${screenName}Screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // Announce screen change
            const screenTitles = {
                welcome: 'Welcome screen',
                registration: 'Registration screen',
                login: 'Login screen',
                dashboard: 'Dashboard',
                settings: 'Settings',
                help: 'Help screen'
            };
            
            const announcement = this.currentLanguage === 'en' ? 
                `Navigated to ${screenTitles[screenName] || screenName}` :
                `${screenTitles[screenName] || screenName} पर पहुंचे`;
            
            setTimeout(() => {
                this.speak(announcement);
            }, 500);
        } else {
            console.error('Screen not found:', screenName);
            this.speak('Screen not found');
        }
    }

    logout() {
        if (this.authSystem && this.currentUser) {
            this.authSystem.logout();
        }
        
        this.currentUser = null;
        this.userDashboard = null;
        
        const message = this.currentLanguage === 'en' ? 
            'Logging out. Thank you for using VaaniSewa!' :
            'लॉगआउट कर रहे हैं। VaaniSewa का उपयोग करने के लिए धन्यवाद!';
        
        this.speak(message);
        setTimeout(() => {
            this.showScreen('welcome');
        }, 2000);
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
        this.updateLanguage();
        
        // Update recognition language
        if (this.recognition) {
            this.recognition.lang = this.currentLanguage === 'en' ? 'en-US' : 'hi-IN';
        }
        
        this.speak(this.currentLanguage === 'en' ? 
            'Language switched to English' : 
            'भाषा हिंदी में बदल गई'
        );
    }

    updateLanguage() {
        const langToggle = document.getElementById('currentLang');
        if (langToggle) {
            langToggle.textContent = this.currentLanguage.toUpperCase();
        }

        // Update specific elements by ID
        const elements = {
            'welcomeTitle': 'welcome',
            'welcomeSubtitle': 'subtitle',
            'registerBtnText': 'register',
            'loginBtnText': 'login',
            'voiceCommandsText': 'voiceCommands',
            'registrationTitle': 'voiceRegistration',
            'regUsernameLabel': 'username',
            'regEmailLabel': 'email',
            'regDisabilityLabel': 'disabilityType',
            'submitRegText': 'submit',
            'cancelRegText': 'cancel',
            'loginTitle': 'voiceLogin',
            'loginUsernameLabel': 'username',
            'submitLoginText': 'login',
            'cancelLoginText': 'cancel',
            'dashboardTitle': 'dashboard',
            'userWelcome': 'welcome_back',
            'settingsBtnText': 'settings',
            'helpBtnText': 'help',
            'logoutBtnText': 'logout',
            'settingsTitle': 'settings',
            'voiceSettingsTitle': 'voiceSettings',
            'speechRateLabel': 'speechRate',
            'speechPitchLabel': 'speechPitch',
            'voiceSelectLabel': 'voice',
            'testVoiceBtnText': 'testVoice',
            'backToDashboardText': 'backToDashboard',
            'helpTitle': 'helpTitle',
            'backFromHelpText': 'back',
            'commandsHint': 'commandsHint'
        };

        Object.entries(elements).forEach(([elementId, translationKey]) => {
            const element = document.getElementById(elementId);
            if (element && this.translations[this.currentLanguage][translationKey]) {
                element.textContent = this.translations[this.currentLanguage][translationKey];
            }
        });
    }

    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(1, this.volume + delta));
        
        // Update volume bar
        const volumeBar = document.getElementById('volumeBar');
        if (volumeBar) {
            volumeBar.style.width = `${this.volume * 100}%`;
        }
        
        this.speak(`Volume ${delta > 0 ? 'increased' : 'decreased'} to ${Math.round(this.volume * 100)} percent`);
    }

    // Helper method for translations
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vaaniSewaApp = new VaaniSewaApp();
});

// Export for global access
window.VaaniSewaApp = VaaniSewaApp;