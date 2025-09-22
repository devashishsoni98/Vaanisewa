// VaaniSewa - Voice Accessibility App
class VaaniSewaApp {
    constructor() {
        this.auth = new AuthSystem();
        this.adminDashboard = null;
        this.userDashboard = null;
        this.currentLanguage = localStorage.getItem('vaanisewa-language') || 'en';
        this.currentUser = this.auth.currentUser;
        this.currentScreen = 'welcome';
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.volume = parseFloat(localStorage.getItem('vaanisewa-volume')) || 0.7;
        this.speechRate = parseFloat(localStorage.getItem('vaanisewa-speech-rate')) || 1.0;
        this.speechPitch = parseFloat(localStorage.getItem('vaanisewa-speech-pitch')) || 1.0;
        this.selectedVoice = localStorage.getItem('vaanisewa-selected-voice') || '';
        
        // Initialize onboarding and help systems
        this.onboardingWizard = null;
        this.contextualHelp = null;
        
        // Language translations
        this.translations = {
            en: {
                welcomeTitle: "Welcome to VaaniSewa",
                welcomeSubtitle: "Voice-powered accessibility for everyone",
                registerBtnText: "Register",
                loginBtnText: "Login",
                voiceCommandsText: "Voice Commands:",
                registrationTitle: "Voice Registration",
                regUsernameLabel: "Username:",
                regEmailLabel: "Email:",
                regDisabilityLabel: "Disability Type:",
                submitRegText: "Register",
                cancelRegText: "Cancel",
                loginTitle: "Voice Login",
                loginUsernameLabel: "Username:",
                submitLoginText: "Login",
                cancelLoginText: "Cancel",
                dashboardTitle: "Dashboard",
                userWelcome: "Welcome back!",
                settingsBtnText: "Settings",
                helpBtnText: "Help",
                logoutBtnText: "Logout",
                settingsTitle: "Settings",
                voiceSettingsTitle: "Voice Settings",
                speechRateLabel: "Speech Rate:",
                speechPitchLabel: "Speech Pitch:",
                voiceSelectLabel: "Voice:",
                testVoiceBtnText: "Test Voice",
                backToDashboardText: "Back to Dashboard",
                helpTitle: "Help & Voice Commands",
                navigationCommandsTitle: "Navigation Commands",
                volumeCommandsTitle: "Volume Commands",
                authCommandsTitle: "Authentication Commands",
                backFromHelpText: "Back",
                statusReady: "Ready to listen",
                statusListening: "Listening...",
                statusProcessing: "Processing...",
                commandsHint: 'Say: "register user", "login", "home", "settings", "help"',
                loadingText: "Processing voice command...",
                registrationSuccess: "Registration successful! Welcome to VaaniSewa!",
                loginSuccess: "Login successful! Welcome back!",
                logoutSuccess: "Logged out successfully. Goodbye!",
                voiceNotSupported: "Voice recognition is not supported in this browser.",
                microphoneError: "Microphone access denied. Please allow microphone access.",
                commandNotRecognized: "Command not recognized. Please try again.",
                fillAllFields: "Please fill all required fields.",
                userNotFound: "User not found. Please register first.",
                testVoiceText: "This is a test of the voice settings. How does this sound?"
            },
            hi: {
                welcomeTitle: "वाणीसेवा में आपका स्वागत है",
                welcomeSubtitle: "सभी के लिए आवाज-संचालित पहुंच",
                registerBtnText: "पंजीकरण",
                loginBtnText: "लॉगिन",
                voiceCommandsText: "आवाज कमांड:",
                registrationTitle: "आवाज पंजीकरण",
                regUsernameLabel: "उपयोगकर्ता नाम:",
                regEmailLabel: "ईमेल:",
                regDisabilityLabel: "विकलांगता प्रकार:",
                submitRegText: "पंजीकरण करें",
                cancelRegText: "रद्द करें",
                loginTitle: "आवाज लॉगिन",
                loginUsernameLabel: "उपयोगकर्ता नाम:",
                submitLoginText: "लॉगिन करें",
                cancelLoginText: "रद्द करें",
                dashboardTitle: "डैशबोर्ड",
                userWelcome: "वापस आपका स्वागत है!",
                settingsBtnText: "सेटिंग्स",
                helpBtnText: "सहायता",
                logoutBtnText: "लॉगआउट",
                settingsTitle: "सेटिंग्स",
                voiceSettingsTitle: "आवाज सेटिंग्स",
                speechRateLabel: "बोलने की गति:",
                speechPitchLabel: "आवाज की पिच:",
                voiceSelectLabel: "आवाज:",
                testVoiceBtnText: "आवाज परीक्षण",
                backToDashboardText: "डैशबोर्ड पर वापस",
                helpTitle: "सहायता और आवाज कमांड",
                navigationCommandsTitle: "नेवीगेशन कमांड",
                volumeCommandsTitle: "वॉल्यूम कमांड",
                authCommandsTitle: "प्रमाणीकरण कमांड",
                backFromHelpText: "वापस",
                statusReady: "सुनने के लिए तैयार",
                statusListening: "सुन रहा है...",
                statusProcessing: "प्रसंस्करण...",
                commandsHint: 'कहें: "उपयोगकर्ता पंजीकरण", "लॉगिन करें", "होम", "सेटिंग्स", "सहायता"',
                loadingText: "आवाज कमांड प्रसंस्करण...",
                registrationSuccess: "पंजीकरण सफल! वाणीसेवा में आपका स्वागत है!",
                loginSuccess: "लॉगिन सफल! वापस आपका स्वागत है!",
                logoutSuccess: "सफलतापूर्वक लॉगआउट। अलविदा!",
                voiceNotSupported: "इस ब्राउज़र में आवाज पहचान समर्थित नहीं है।",
                microphoneError: "माइक्रोफोन पहुंच अस्वीकृत। कृपया माइक्रोफोन पहुंच की अनुमति दें।",
                commandNotRecognized: "कमांड पहचाना नहीं गया। कृपया फिर से कोशिश करें।",
                fillAllFields: "कृपया सभी आवश्यक फ़ील्ड भरें।",
                userNotFound: "उपयोगकर्ता नहीं मिला। कृपया पहले पंजीकरण करें।",
                testVoiceText: "यह आवाज सेटिंग्स का परीक्षण है। यह कैसा लगता है?"
            }
        };

        // Voice commands mapping
        this.voiceCommands = {
            en: {
                'register user': () => this.showScreen('registration'),
                'registration': () => this.showScreen('registration'),
                'login': () => this.showScreen('login'),
                'sign in': () => this.showScreen('login'),
                'home': () => this.showScreen('dashboard'),
                'dashboard': () => this.showScreen('dashboard'),
                'settings': () => this.showScreen('settings'),
                'help': () => this.showScreen('help'),
                'logout': () => this.logout(),
                'sign out': () => this.logout(),
                'volume up': () => this.adjustVolume(0.1),
                'volume down': () => this.adjustVolume(-0.1),
                'increase volume': () => this.adjustVolume(0.1),
                'decrease volume': () => this.adjustVolume(-0.1)
            },
            hi: {
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
                'वॉल्यूम बढ़ाएं': () => this.adjustVolume(0.1),
                'वॉल्यूम कम करें': () => this.adjustVolume(-0.1)
            }
        };

        this.init();
    }

    init() {
        this.setupVoiceRecognition();
        this.setupEventListeners();
        this.loadVoices();
        this.updateLanguage();
        this.updateVolumeDisplay();
        this.updateSpeechSettings();
        
        // Initialize help and onboarding systems after DOM is ready
        setTimeout(() => {
            this.initializeHelpSystems();
        }, 100);
        
        // Initialize dashboards based on user role
        if (this.auth.currentUser) {
            this.currentUser = this.auth.currentUser;
            this.initializeDashboards();
            this.checkOnboarding();
        } else {
            this.showScreen('welcome');
            // Set up demo accounts
            this.setupDemoAccounts();
        }

        // Start listening for voice commands
        this.startListening();
        
        // Setup session management
        this.setupSessionManagement();
    }

    initializeHelpSystems() {
        try {
            // Initialize contextual help system
            if (typeof ContextualHelp !== 'undefined') {
                this.contextualHelp = new ContextualHelp(this);
            }
            
            // Initialize onboarding wizard
            if (typeof OnboardingWizard !== 'undefined') {
                this.onboardingWizard = new OnboardingWizard(this);
            }
        } catch (error) {
            console.warn('Help systems not available:', error);
        }
    }

    setupDemoAccounts() {
        // Create demo accounts if they don't exist
        const users = this.auth.getUsers();
        const demoAccounts = [
            {
                id: 'demo-student-1',
                username: 'student1',
                email: 'student1@vaanisewa.demo',
                role: 'student',
                disability: 'visual',
                isActive: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: {
                    language: 'en',
                    speechRate: 1.0,
                    speechPitch: 1.0,
                    volume: 0.7,
                    highContrast: false,
                    reducedMotion: false
                }
            },
            {
                id: 'demo-admin-1',
                username: 'admin',
                email: 'admin@vaanisewa.demo',
                role: 'admin',
                disability: 'other',
                isActive: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: {
                    language: 'en',
                    speechRate: 1.0,
                    speechPitch: 1.0,
                    volume: 0.7,
                    highContrast: false,
                    reducedMotion: false
                }
            },
            {
                id: 'demo-institution-1',
                username: 'institution_admin',
                email: 'institution@vaanisewa.demo',
                role: 'institution_admin',
                disability: 'mobility',
                isActive: true,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                preferences: {
                    language: 'en',
                    speechRate: 1.0,
                    speechPitch: 1.0,
                    volume: 0.7,
                    highContrast: false,
                    reducedMotion: false
                }
            }
        ];

        // Add demo accounts if they don't exist
        demoAccounts.forEach(demoAccount => {
            const existingUser = users.find(u => u.username === demoAccount.username);
            if (!existingUser) {
                users.push(demoAccount);
            }
        });

        localStorage.setItem('vaanisewa-users', JSON.stringify(users));
        
        // Show demo account info
        this.showDemoAccountInfo();
    }

    showDemoAccountInfo() {
        const demoInfo = document.createElement('div');
        demoInfo.className = 'demo-info';
        demoInfo.innerHTML = `
            <div class="demo-info-content">
                <h3>Demo Accounts Available</h3>
                <ul>
                    <li><strong>Student:</strong> username: "student1"</li>
                    <li><strong>Admin:</strong> username: "admin"</li>
                    <li><strong>Institution Admin:</strong> username: "institution_admin"</li>
                </ul>
                <p>You can also register a new account or use voice commands!</p>
                <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
            </div>
        `;
        
        document.body.appendChild(demoInfo);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (demoInfo.parentElement) {
                demoInfo.remove();
            }
        }, 10000);
    }

    checkOnboarding() {
        // Show onboarding for new users or after login
        if (this.onboardingWizard && OnboardingWizard.shouldShowOnboarding() && this.auth.currentUser) {
            setTimeout(() => {
                this.onboardingWizard.start();
            }, 1000); // Delay to ensure UI is ready
        }
    }

    initializeDashboards() {
        if (this.auth.hasRole('admin') || this.auth.hasRole('institution_admin')) {
            this.adminDashboard = new AdminDashboard(this.auth);
            this.showScreen('admin');
        } else {
            this.userDashboard = new UserDashboard(this.auth);
            this.showScreen('user');
        }
    }

    setupSessionManagement() {
        // Listen for session expiration
        window.addEventListener('sessionExpired', () => {
            this.speak('Your session has expired. Please log in again.');
            this.logout();
        });
        
        // Update activity on user interaction
        document.addEventListener('click', () => {
            if (this.auth.currentUser) {
                this.auth.updateLastActivity();
            }
        });
        
        document.addEventListener('keydown', () => {
            if (this.auth.currentUser) {
                this.auth.updateLastActivity();
            }
        });
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateListeningStatus();
                console.log('Voice recognition started');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateListeningStatus();
                console.log('Voice recognition ended, restarting...');
                // Restart listening after a short delay
                setTimeout(() => this.startListening(), 1000);
            };
            
            this.recognition.onresult = (event) => {
                const lastResult = event.results[event.results.length - 1];
                if (lastResult.isFinal) {
                    const command = lastResult[0].transcript.toLowerCase().trim();
                    console.log('Voice command received:', command);
                    // Log voice command activity
                    if (this.auth.currentUser) {
                        this.auth.logActivity('voice_command', { command });
                    }
                    this.processVoiceCommand(command);
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    this.speak(this.translations[this.currentLanguage].microphoneError);
                } else if (event.error === 'no-speech') {
                    console.log('No speech detected, continuing...');
                } else if (event.error === 'aborted') {
                    console.log('Speech recognition aborted, will restart via onend handler');
                } else if (event.error === 'network') {
                    console.log('Network error, will restart via onend handler');
                }
            };
        } else {
            console.warn('Speech recognition not supported');
            this.speak(this.translations[this.currentLanguage].voiceNotSupported);
        }
    }

    setupEventListeners() {
        // Language toggle
        document.getElementById('languageToggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Volume controls
        document.getElementById('volumeUp').addEventListener('click', () => {
            this.adjustVolume(0.1);
        });

        document.getElementById('volumeDown').addEventListener('click', () => {
            this.adjustVolume(-0.1);
        });

        // Navigation buttons
        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showScreen('registration');
        });

        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showScreen('login');
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showScreen('settings');
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showScreen('help');
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Form submissions
        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLoginWithRole();
        });

        // Cancel buttons
        document.getElementById('cancelRegBtn').addEventListener('click', () => {
            this.showScreen('welcome');
        });

        document.getElementById('cancelLoginBtn').addEventListener('click', () => {
            this.showScreen('welcome');
        });

        // Settings controls
        document.getElementById('speechRate').addEventListener('input', (e) => {
            this.speechRate = parseFloat(e.target.value);
            document.getElementById('speechRateValue').textContent = this.speechRate.toFixed(1);
            localStorage.setItem('vaanisewa-speech-rate', this.speechRate);
        });

        document.getElementById('speechPitch').addEventListener('input', (e) => {
            this.speechPitch = parseFloat(e.target.value);
            document.getElementById('speechPitchValue').textContent = this.speechPitch.toFixed(1);
            localStorage.setItem('vaanisewa-speech-pitch', this.speechPitch);
        });

        document.getElementById('voiceSelect').addEventListener('change', (e) => {
            this.selectedVoice = e.target.value;
            localStorage.setItem('vaanisewa-selected-voice', this.selectedVoice);
        });

        document.getElementById('testVoiceBtn').addEventListener('click', () => {
            this.speak(this.translations[this.currentLanguage].testVoiceText);
        });

        document.getElementById('backToDashboardBtn').addEventListener('click', () => {
            this.showScreen('dashboard');
        });

        document.getElementById('backFromHelpBtn').addEventListener('click', () => {
            if (this.currentUser) {
                this.showScreen('dashboard');
            } else {
                this.showScreen('welcome');
            }
        });

        // Microphone buttons for form fields
        document.querySelectorAll('.mic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.target.closest('.mic-btn').dataset.field;
                this.startFieldVoiceInput(field);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.stopListening();
            }
        });
    }

    loadVoices() {
        const loadVoicesHandler = () => {
            this.voices = this.synthesis.getVoices();
            const voiceSelect = document.getElementById('voiceSelect');
            voiceSelect.innerHTML = '<option value="">Default Voice</option>';
            
            this.voices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.name === this.selectedVoice) {
                    option.selected = true;
                }
                voiceSelect.appendChild(option);
            });
        };

        if (this.synthesis.getVoices().length > 0) {
            loadVoicesHandler();
        } else {
            this.synthesis.addEventListener('voiceschanged', loadVoicesHandler);
        }
    }

    speak(text, callback = null) {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = this.speechRate;
        utterance.pitch = this.speechPitch;
        utterance.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';

        if (this.selectedVoice) {
            const voice = this.voices.find(v => v.name === this.selectedVoice);
            if (voice) {
                utterance.voice = voice;
            }
        }

        if (callback) {
            utterance.onend = callback;
        }

        this.synthesis.speak(utterance);
    }

    startListening() {
        if (this.recognition && !this.isListening) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    updateListeningStatus() {
        const statusText = document.getElementById('statusText');
        const micIcon = document.getElementById('micIcon');
        const listeningStatus = document.querySelector('.listening-status');

        if (this.isListening) {
            statusText.textContent = this.translations[this.currentLanguage].statusListening;
            micIcon.className = 'fas fa-microphone';
            listeningStatus.classList.add('active');
        } else {
            statusText.textContent = this.translations[this.currentLanguage].statusReady;
            micIcon.className = 'fas fa-microphone-slash';
            listeningStatus.classList.remove('active');
        }
    }

    processVoiceCommand(command) {
        console.log('Voice command received:', command);
        
        this.showLoading();
        
        // Check commands in current language
        const commands = this.voiceCommands[this.currentLanguage];
        let commandFound = false;

        for (const [key, action] of Object.entries(commands)) {
            if (command.includes(key)) {
                commandFound = true;
                setTimeout(() => {
                    this.hideLoading();
                    action();
                }, 500);
                break;
            }
        }

        if (!commandFound) {
            setTimeout(() => {
                this.hideLoading();
                this.speak(this.translations[this.currentLanguage].commandNotRecognized);
            }, 500);
        }
    }

    startFieldVoiceInput(fieldName) {
        const button = document.querySelector(`[data-field="${fieldName}"]`);
        const input = document.getElementById(fieldName) || document.getElementById(`reg${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`);
        
        if (!input || !this.recognition) return;

        button.classList.add('listening');
        
        const tempRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        tempRecognition.continuous = false;
        tempRecognition.interimResults = false;
        tempRecognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';

        tempRecognition.onresult = (event) => {
            const result = event.results[0][0].transcript;
            
            if (fieldName === 'disability') {
                // Map voice input to select options
                const disabilityMap = {
                    'visual': 'visual',
                    'sight': 'visual',
                    'blind': 'visual',
                    'hearing': 'hearing',
                    'deaf': 'hearing',
                    'mobility': 'mobility',
                    'movement': 'mobility',
                    'cognitive': 'cognitive',
                    'mental': 'cognitive',
                    'other': 'other'
                };
                
                const lowerResult = result.toLowerCase();
                for (const [key, value] of Object.entries(disabilityMap)) {
                    if (lowerResult.includes(key)) {
                        input.value = value;
                        break;
                    }
                }
            } else {
                input.value = result;
            }
            
            button.classList.remove('listening');
            this.speak(`${fieldName} set to ${result}`);
        };

        tempRecognition.onerror = () => {
            button.classList.remove('listening');
        };

        tempRecognition.onend = () => {
            button.classList.remove('listening');
        };

        tempRecognition.start();
    }

    handleRegistration() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const disability = document.getElementById('regDisability').value;

        if (!username || !email || !disability) {
            this.speak(this.translations[this.currentLanguage].fillAllFields);
            return;
        }

        // Check if user already exists
        const users = this.auth.getUsers();
        const existingUser = users.find(u => u.username === username || u.email === email);
        
        if (existingUser) {
            this.speak('User already exists. Please try a different username or email.');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            role: 'student',
            disability,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            isActive: true,
            preferences: {
                language: this.currentLanguage,
                speechRate: this.speechRate,
                speechPitch: this.speechPitch,
                volume: this.volume,
                highContrast: false,
                reducedMotion: false
            }
        };

        // Add to users list
        users.push(newUser);
        localStorage.setItem('vaanisewa-users', JSON.stringify(users));

        // Log the user in
        const result = this.auth.login(username, 'default_password', 'student');
        this.currentUser = result.user;

        this.speak(this.translations[this.currentLanguage].registrationSuccess, () => {
            this.initializeDashboards();
        });
    }

    handleLoginWithRole() {
        const username = document.getElementById('loginUsername').value.trim();

        if (!username) {
            this.speak(this.translations[this.currentLanguage].fillAllFields);
            return;
        }

        // Determine role based on username pattern (for demo)
        let role = 'student';
        if (username.includes('admin')) {
            role = 'admin';
        } else if (username.includes('institution')) {
            role = 'institution_admin';
        }
        
        const result = this.auth.login(username, 'default_password', role);
        
        if (!result.success) {
            this.speak(this.translations[this.currentLanguage].userNotFound);
            return;
        }

        this.currentUser = result.user;
        this.speak(this.translations[this.currentLanguage].loginSuccess, () => {
            this.initializeDashboards();
            // Check for onboarding on login
            this.checkOnboarding();
        });
    }

    handleLogout() {
        this.auth.logout();
        this.currentUser = null;
        this.adminDashboard = null;
        this.userDashboard = null;
        this.speak(this.translations[this.currentLanguage].logoutSuccess, () => {
            this.showScreen('welcome');
        });
    }
    
    logout() {
        this.handleLogout();
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        let targetScreen;
        if (screenName === 'admin') {
            targetScreen = document.getElementById('adminDashboard');
        } else if (screenName === 'user') {
            targetScreen = document.getElementById('userDashboard');
        } else {
            targetScreen = document.getElementById(`${screenName}Screen`);
        }
        
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
            
            // Clear form fields when showing forms
            if (screenName === 'registration') {
                document.getElementById('registrationForm').reset();
            } else if (screenName === 'login') {
                document.getElementById('loginForm').reset();
            }
        }
    }

    updateUserInfo() {
        if (this.currentUser) {
            const userWelcome = document.getElementById('userWelcome');
            const userInfo = document.getElementById('userInfo');
            
            userWelcome.textContent = `${this.translations[this.currentLanguage].userWelcome} ${this.currentUser.username}!`;
            userInfo.textContent = `Email: ${this.currentUser.email} | Disability: ${this.currentUser.disability}`;
        }
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
        localStorage.setItem('vaanisewa-language', this.currentLanguage);
        
        this.updateLanguage();
        
        // Update voice recognition language
        if (this.recognition) {
            this.recognition.lang = this.currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
        }
    }

    updateLanguage() {
        const currentLang = document.getElementById('currentLang');
        currentLang.textContent = this.currentLanguage.toUpperCase();

        // Update all translatable elements
        const translations = this.translations[this.currentLanguage];
        for (const [key, value] of Object.entries(translations)) {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = value;
            }
        }

        // Update voice commands list
        const commandsList = document.getElementById('voiceCommandsList');
        const navigationList = document.getElementById('navigationCommandsList');
        const volumeList = document.getElementById('volumeCommandsList');
        const authList = document.getElementById('authCommandsList');

        if (this.currentLanguage === 'hi') {
            if (commandsList) {
                commandsList.innerHTML = `
                    <li>"उपयोगकर्ता पंजीकरण" - पंजीकरण शुरू करें</li>
                    <li>"लॉगिन करें" - लॉगिन प्रक्रिया शुरू करें</li>
                    <li>"सहायता" - सहायता प्राप्त करें</li>
                `;
            }
            if (navigationList) {
                navigationList.innerHTML = `
                    <li>"होम" - डैशबोर्ड पर जाएं</li>
                    <li>"सेटिंग्स" - सेटिंग्स खोलें</li>
                    <li>"सहायता" - यह सहायता दिखाएं</li>
                    <li>"लॉगआउट" - साइन आउट करें</li>
                `;
            }
            if (volumeList) {
                volumeList.innerHTML = `
                    <li>"आवाज़ बढ़ाएं" - वॉल्यूम बढ़ाएं</li>
                    <li>"आवाज़ कम करें" - वॉल्यूम कम करें</li>
                `;
            }
            if (authList) {
                authList.innerHTML = `
                    <li>"उपयोगकर्ता पंजीकरण" - पंजीकरण शुरू करें</li>
                    <li>"लॉगिन करें" - लॉगिन शुरू करें</li>
                `;
            }
        } else {
            if (commandsList) {
                commandsList.innerHTML = `
                    <li>"register user" - Start registration</li>
                    <li>"login" - Start login process</li>
                    <li>"help" - Get assistance</li>
                `;
            }
            if (navigationList) {
                navigationList.innerHTML = `
                    <li>"home" - Go to dashboard</li>
                    <li>"settings" - Open settings</li>
                    <li>"help" - Show this help</li>
                    <li>"logout" - Sign out</li>
                `;
            }
            if (volumeList) {
                volumeList.innerHTML = `
                    <li>"volume up" - Increase volume</li>
                    <li>"volume down" - Decrease volume</li>
                `;
            }
            if (authList) {
                authList.innerHTML = `
                    <li>"register user" - Start registration</li>
                    <li>"login" - Start login</li>
                `;
            }
        }

        // Update commands hint
        const commandsHint = document.getElementById('commandsHint');
        if (commandsHint) {
            commandsHint.textContent = translations.commandsHint;
        }
    }

    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(1, this.volume + delta));
        localStorage.setItem('vaanisewa-volume', this.volume);
        this.updateVolumeDisplay();
        
        const volumeText = this.currentLanguage === 'hi' ? 
            `वॉल्यूम ${Math.round(this.volume * 100)} प्रतिशत` :
            `Volume ${Math.round(this.volume * 100)} percent`;
        this.speak(volumeText);
    }

    updateVolumeDisplay() {
        const volumeBar = document.getElementById('volumeBar');
        volumeBar.style.width = `${this.volume * 100}%`;
    }

    updateSpeechSettings() {
        document.getElementById('speechRate').value = this.speechRate;
        document.getElementById('speechRateValue').textContent = this.speechRate.toFixed(1);
        document.getElementById('speechPitch').value = this.speechPitch;
        document.getElementById('speechPitchValue').textContent = this.speechPitch.toFixed(1);
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for all scripts to load
    setTimeout(() => {
        try {
            // Initialize security manager
            if (typeof SecurityManager !== 'undefined') {
                window.securityManager = new SecurityManager();
            }
            
            // Initialize the main app
            window.vaaniSewaApp = new VaaniSewaApp();
            
            // Initialize data manager
            if (typeof DataManager !== 'undefined' && window.vaaniSewaApp.auth) {
                window.dataManager = new DataManager(window.vaaniSewaApp.auth);
            }
            
            // Make dashboards globally accessible for event handlers
            window.adminDashboard = window.vaaniSewaApp.adminDashboard;
            window.userDashboard = window.vaaniSewaApp.userDashboard;
            
            console.log('VaaniSewa app initialized successfully!');
        } catch (error) {
            console.error('Error initializing VaaniSewa app:', error);
        }
    }, 500);
});