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
        this.continuousListening = true;
        this.recognitionTimeout = null;
        this.restartTimeout = null;
        this.isRecognitionActive = false;
        this.lastSpeechTime = 0;
        this.silenceTimeout = null;
        
        // Translation object
        this.translations = {
            en: {
                welcome: "Welcome to VaaniSewa",
                subtitle: "Voice-powered accessibility for everyone",
                register: "Register",
                login: "Login",
                voiceCommands: "Voice Commands:",
                registerCommand: '"register user" - Start registration',
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
                commandsHint: 'Say: "register user", "login", "home", "settings", "help"'
            },
            hi: {
                welcome: "VaaniSewa में आपका स्वागत है",
                subtitle: "सभी के लिए आवाज-संचालित पहुंच",
                register: "पंजीकरण",
                login: "लॉगिन",
                voiceCommands: "आवाज कमांड:",
                registerCommand: '"उपयोगकर्ता पंजीकरण" - पंजीकरण शुरू करें',
                loginCommand: '"लॉगिन करें" - लॉगिन प्रक्रिया शुरू करें',
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
                commandsHint: 'कहें: "उपयोगकर्ता पंजीकरण", "लॉगिन करें", "होम", "सेटिंग्स", "सहायता"'
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
            // Load voices
            await this.loadVoices();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize voice recognition
            await this.initializeVoiceRecognition();
            
            // Update UI with current language
            this.updateLanguage();
            
            // Start continuous listening
            this.startContinuousListening();
            
            console.log('VaaniSewa App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.speak('Application initialization failed. Some features may not work properly.');
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
                    // Voices not loaded yet, wait a bit
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

    async initializeVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            this.updateStatus('Speech recognition not supported in this browser', false);
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Configure recognition
            this.recognition.continuous = false; // We'll handle continuous manually
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 3;
            this.recognition.lang = this.currentLanguage === 'en' ? 'en-US' : 'hi-IN';

            // Event handlers
            this.recognition.onstart = () => {
                console.log('Speech recognition started');
                this.isRecognitionActive = true;
                this.updateStatus(this.t('listening'), true);
                this.clearTimeouts();
            };

            this.recognition.onresult = (event) => {
                console.log('Speech recognition result received');
                this.handleSpeechResult(event);
            };

            this.recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
                this.handleSpeechError(event);
            };

            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                this.isRecognitionActive = false;
                this.handleSpeechEnd();
            };

            console.log('Voice recognition initialized successfully');
            this.updateStatus(this.t('readyToListen'), false);
            
        } catch (error) {
            console.error('Error initializing voice recognition:', error);
            this.updateStatus('Voice recognition initialization failed', false);
        }
    }

    handleSpeechResult(event) {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) {
            console.log('Final transcript:', finalTranscript);
            this.lastSpeechTime = Date.now();
            this.processVoiceCommand(finalTranscript.trim().toLowerCase());
        } else if (interimTranscript) {
            console.log('Interim transcript:', interimTranscript);
            // Show interim results in status
            this.updateStatus(`${this.t('listening')} "${interimTranscript}"`, true);
        }
    }

    handleSpeechError(event) {
        console.log('Speech error details:', event.error, event.message);
        
        switch (event.error) {
            case 'no-speech':
                console.log('No speech detected, restarting...');
                break;
            case 'audio-capture':
                console.error('Audio capture failed');
                this.updateStatus('Microphone access failed', false);
                this.speak('Microphone access failed. Please check your microphone permissions.');
                return;
            case 'not-allowed':
                console.error('Speech recognition not allowed');
                this.updateStatus('Speech recognition not allowed', false);
                this.speak('Speech recognition permission denied. Please allow microphone access.');
                return;
            case 'network':
                console.error('Network error in speech recognition');
                this.updateStatus('Network error in speech recognition', false);
                break;
            case 'aborted':
                console.log('Speech recognition aborted, will restart if needed');
                break;
            case 'interrupted':
                console.log('Speech recognition interrupted, will restart if needed');
                break;
            default:
                console.error('Unknown speech recognition error:', event.error);
                break;
        }

        // Ensure recognition state is properly reset on error
        this.isRecognitionActive = false;

        // Don't restart immediately on certain errors
        if (['not-allowed', 'audio-capture'].includes(event.error)) {
            this.continuousListening = false;
            return;
        }
    }

    handleSpeechEnd() {
        this.isRecognitionActive = false;
        
        if (this.continuousListening) {
            // Restart recognition after a short delay
            this.restartTimeout = setTimeout(() => {
                if (this.continuousListening && !this.isRecognitionActive) {
                    this.startListening();
                }
            }, 1000);
        } else {
            this.updateStatus(this.t('clickToStart'), false);
        }
    }

    startContinuousListening() {
        this.continuousListening = true;
        this.startListening();
    }

    stopContinuousListening() {
        this.continuousListening = false;
        this.clearTimeouts();
        if (this.isRecognitionActive && this.recognition) {
            this.recognition.stop();
        }
        this.updateStatus(this.t('clickToStart'), false);
    }

    startListening() {
        if (!this.recognition) {
            console.warn('Speech recognition not available');
            return;
        }

        // If recognition is already active, don't start again
        if (this.isRecognitionActive) {
            console.log('Recognition already active, skipping start');
            return;
        }

        try {
            // Update language if changed
            this.recognition.lang = this.currentLanguage === 'en' ? 'en-US' : 'hi-IN';
            
            console.log('Starting speech recognition...');
            this.recognition.start();
            
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.isRecognitionActive = false;
            
            // Try to restart after a delay if continuous listening is enabled
            if (this.continuousListening) {
                this.restartTimeout = setTimeout(() => {
                    if (!this.isRecognitionActive) {
                        this.startListening();
                    }
                }, 2000);
            }
        }
    }

    clearTimeouts() {
        if (this.recognitionTimeout) {
            clearTimeout(this.recognitionTimeout);
            this.recognitionTimeout = null;
        }
        if (this.restartTimeout) {
            clearTimeout(this.restartTimeout);
            this.restartTimeout = null;
        }
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }
    }

    processVoiceCommand(command) {
        console.log('Processing voice command:', command);
        
        // Show processing status
        this.updateStatus(this.t('processing'), true);
        
        // Temporarily stop continuous listening while processing command
        const wasListening = this.isRecognitionActive;
        if (wasListening && this.recognition) {
            this.recognition.stop();
        }
        
        // Define command mappings for both languages
        const commands = {
            // English commands
            'register user': () => this.showScreen('registration'),
            'register': () => this.showScreen('registration'),
            'registration': () => this.showScreen('registration'),
            'login': () => this.showScreen('login'),
            'log in': () => this.showScreen('login'),
            'home': () => this.showScreen('dashboard'),
            'dashboard': () => this.showScreen('dashboard'),
            'settings': () => this.showScreen('settings'),
            'help': () => this.showScreen('help'),
            'logout': () => this.logout(),
            'log out': () => this.logout(),
            'back': () => this.goBack(),
            'go back': () => this.goBack(),
            'volume up': () => this.adjustVolume(0.1),
            'volume down': () => this.adjustVolume(-0.1),
            'increase volume': () => this.adjustVolume(0.1),
            'decrease volume': () => this.adjustVolume(-0.1),
            
            // Hindi commands
            'उपयोगकर्ता पंजीकरण': () => this.showScreen('registration'),
            'पंजीकरण': () => this.showScreen('registration'),
            'लॉगिन करें': () => this.showScreen('login'),
            'लॉगिन': () => this.showScreen('login'),
            'होम': () => this.showScreen('dashboard'),
            'डैशबोर्ड': () => this.showScreen('dashboard'),
            'सेटिंग्स': () => this.showScreen('settings'),
            'सहायता': () => this.showScreen('help'),
            'लॉगआउट': () => this.logout(),
            'आवाज़ बढ़ाएं': () => this.adjustVolume(0.1),
            'आवाज़ कम करें': () => this.adjustVolume(-0.1),
            'वापस': () => this.goBack(),
        };

        // Find and execute command
        let commandFound = null;
        let bestMatch = '';
        
        // Find the best matching command (longest match)
        Object.keys(commands).forEach(cmd => {
            if (command.includes(cmd.toLowerCase()) && cmd.length > bestMatch.length) {
                commandFound = cmd;
                bestMatch = cmd;
            }
        });
        
        // Also try exact matches
        if (!commandFound) {
            commandFound = Object.keys(commands).find(cmd => 
                cmd.toLowerCase() === command
            );
        }
        
        // Try partial matches for common variations
        if (!commandFound) {
            const partialMatches = {
                'register': 'register user',
                'पंजीकरण': 'उपयोगकर्ता पंजीकरण',
                'volume': command.includes('up') ? 'volume up' : 'volume down',
                'आवाज़': command.includes('बढ़') ? 'आवाज़ बढ़ाएं' : 'आवाज़ कम करें'
            };
            
            Object.keys(partialMatches).forEach(partial => {
                if (command.includes(partial) && commands[partialMatches[partial]]) {
                    commandFound = partialMatches[partial];
                }
            });
        }

        if (commandFound && commands[commandFound]) {
            console.log('Executing command:', commandFound);
            try {
                commands[commandFound]();
                this.speak(this.currentLanguage === 'en' ? 
                    `Command executed: ${commandFound}` : 
                    `कमांड निष्पादित: ${commandFound}`
        );
            } catch (error) {
                console.error('Error executing command:', error);
                this.speak(this.currentLanguage === 'en' ? 
                    'Error executing command' : 
                    'कमांड निष्पादित करने में त्रुटि'
                );
            }
        } else {
            console.log('Command not recognized:', command);
            this.speak(this.currentLanguage === 'en' ? 
                'Command not recognized. Say "help" to see available commands.' :
                'कमांड पहचाना नहीं गया। उपलब्ध कमांड देखने के लिए "सहायता" कहें।'
            );
        }

        // Reset status after processing
        setTimeout(() => {
            if (this.continuousListening && !this.isRecognitionActive) {
                this.updateStatus(this.t('readyToListen'), false);
                this.startListening();
            }
        }, 1500);
    }

    goBack() {
        // Simple back navigation logic
        if (this.currentScreen === 'dashboard') {
            this.showScreen('welcome');
        } else if (['settings', 'help'].includes(this.currentScreen)) {
            this.showScreen('dashboard');
        } else {
            this.showScreen('welcome');
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
        } else {
            // Try to find a voice for current language
            const langVoice = this.voices.find(voice => 
                voice.lang.startsWith(this.currentLanguage)
            );
            if (langVoice) {
                utterance.voice = langVoice;
            }
        }

        utterance.onstart = () => {
            console.log('Speech synthesis started');
            // Temporarily stop listening while speaking
            if (this.isRecognitionActive && this.recognition) {
                this.recognition.stop();
            }
        };

        utterance.onend = () => {
            console.log('Speech synthesis ended');
            // Resume listening after speaking
            if (this.continuousListening && !this.isRecognitionActive) {
                setTimeout(() => {
                    this.startListening();
                }, 500);
            }
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            // Resume listening even if speech fails
            if (this.continuousListening && !this.isRecognitionActive) {
                setTimeout(() => {
                    this.startListening();
                }, 500);
            }
        };

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
            registerBtn.addEventListener('click', () => this.showScreen('registration'));
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showScreen('login'));
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showScreen('settings'));
        }
        
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showScreen('help'));
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Back buttons
        const backToDashboardBtn = document.getElementById('backToDashboardBtn');
        const backFromHelpBtn = document.getElementById('backFromHelpBtn');
        const cancelRegBtn = document.getElementById('cancelRegBtn');
        const cancelLoginBtn = document.getElementById('cancelLoginBtn');

        if (backToDashboardBtn) {
            backToDashboardBtn.addEventListener('click', () => this.showScreen('dashboard'));
        }
        
        if (backFromHelpBtn) {
            backFromHelpBtn.addEventListener('click', () => this.showScreen('welcome'));
        }
        
        if (cancelRegBtn) {
            cancelRegBtn.addEventListener('click', () => this.showScreen('welcome'));
        }
        
        if (cancelLoginBtn) {
            cancelLoginBtn.addEventListener('click', () => this.showScreen('welcome'));
        }

        // Form submissions
        const registrationForm = document.getElementById('registrationForm');
        const loginForm = document.getElementById('loginForm');

        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Voice input buttons
        document.querySelectorAll('.mic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.target.closest('.mic-btn').dataset.field;
                this.handleVoiceInput(field);
            });
        });

        // Settings controls
        const speechRate = document.getElementById('speechRate');
        const speechPitch = document.getElementById('speechPitch');
        const voiceSelect = document.getElementById('voiceSelect');
        const testVoiceBtn = document.getElementById('testVoiceBtn');

        if (speechRate) {
            speechRate.addEventListener('input', (e) => {
                this.speechRate = parseFloat(e.target.value);
                document.getElementById('speechRateValue').textContent = this.speechRate.toFixed(1);
            });
        }
        
        if (speechPitch) {
            speechPitch.addEventListener('input', (e) => {
                this.speechPitch = parseFloat(e.target.value);
                document.getElementById('speechPitchValue').textContent = this.speechPitch.toFixed(1);
            });
        }
        
        if (voiceSelect) {
            voiceSelect.addEventListener('change', (e) => {
                this.selectedVoice = e.target.value ? parseInt(e.target.value) : null;
            });
        }
        
        if (testVoiceBtn) {
            testVoiceBtn.addEventListener('click', () => {
                this.speak('This is a test of your voice settings.');
            });
        }

        // Manual listening toggle (click on status bar)
        const listeningStatus = document.querySelector('.listening-status');
        if (listeningStatus) {
            listeningStatus.addEventListener('click', () => {
                if (this.continuousListening) {
                    this.stopContinuousListening();
                } else {
                    this.startContinuousListening();
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showScreen('help');
            }
        });
    }

    handleVoiceInput(field) {
        if (!this.recognition) {
            this.speak('Voice input not available');
            return;
        }

        // Temporarily stop continuous listening
        const wasContinuous = this.continuousListening;
        this.stopContinuousListening();

        // Create a temporary recognition instance for form input
        const tempRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        tempRecognition.continuous = false;
        tempRecognition.interimResults = false;
        tempRecognition.lang = this.currentLanguage === 'en' ? 'en-US' : 'hi-IN';

        const micBtn = document.querySelector(`[data-field="${field}"]`);
        if (micBtn) {
            micBtn.classList.add('listening');
        }

        tempRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Voice input result:', transcript);
            
            // Fill the appropriate field
            this.fillFormField(field, transcript);
            
            if (micBtn) {
                micBtn.classList.remove('listening');
            }
            
            // Resume continuous listening if it was active
            if (wasContinuous) {
                setTimeout(() => {
                    this.startContinuousListening();
                }, 1000);
            }
        };

        tempRecognition.onerror = (event) => {
            console.error('Voice input error:', event.error);
            if (micBtn) {
                micBtn.classList.remove('listening');
            }
            
            // Resume continuous listening if it was active
            if (wasContinuous) {
                setTimeout(() => {
                    this.startContinuousListening();
                }, 1000);
            }
        };

        tempRecognition.start();
        this.speak('Please speak now');
    }

    fillFormField(field, value) {
        let input;
        
        switch (field) {
            case 'username':
                input = document.getElementById('regUsername');
                break;
            case 'email':
                input = document.getElementById('regEmail');
                break;
            case 'disability':
                input = document.getElementById('regDisability');
                // Map voice input to disability options
                const disabilityMap = {
                    'visual': 'visual',
                    'sight': 'visual',
                    'blind': 'visual',
                    'hearing': 'hearing',
                    'deaf': 'hearing',
                    'mobility': 'mobility',
                    'physical': 'mobility',
                    'cognitive': 'cognitive',
                    'mental': 'cognitive',
                    'other': 'other'
                };
                
                const disability = Object.keys(disabilityMap).find(key => 
                    value.toLowerCase().includes(key)
                );
                
                if (disability) {
                    input.value = disabilityMap[disability];
                }
                return;
            case 'loginUsername':
                input = document.getElementById('loginUsername');
                break;
            default:
                console.warn('Unknown field:', field);
                return;
        }
        
        if (input) {
            input.value = value;
            this.speak(`Field filled with: ${value}`);
        }
    }

    handleRegistration() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const disability = document.getElementById('regDisability').value;

        if (!username || !email || !disability) {
            this.speak('Please fill in all required fields');
            return;
        }

        // Simulate registration
        console.log('Registration:', { username, email, disability });
        this.speak('Registration successful! Welcome to VaaniSewa.');
        
        // Show dashboard
        setTimeout(() => {
            this.showScreen('dashboard');
        }, 2000);
    }

    handleLogin() {
        const username = document.getElementById('loginUsername').value;

        if (!username) {
            this.speak('Please enter your username');
            return;
        }

        // Simulate login
        console.log('Login:', { username });
        this.speak(`Welcome back, ${username}!`);
        
        // Show dashboard
        setTimeout(() => {
            this.showScreen('dashboard');
        }, 2000);
    }

    showScreen(screenName) {
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
            
            this.speak(`Navigated to ${screenTitles[screenName] || screenName}`);
        }
    }

    logout() {
        this.speak('Logging out. Thank you for using VaaniSewa!');
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

        // Update all translatable elements
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            if (this.translations[this.currentLanguage][key]) {
                element.textContent = this.translations[this.currentLanguage][key];
            }
        });

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