// Onboarding Wizard System
class OnboardingWizard {
    constructor(app) {
        this.app = app;
        this.currentStep = 0;
        this.totalSteps = 6;
        this.isActive = false;
        this.steps = [
            {
                id: 'welcome',
                title: 'Welcome to VaaniSewa!',
                content: 'Let\'s get you started with voice-powered accessibility. This wizard will guide you through the key features.',
                target: null,
                action: 'introduction'
            },
            {
                id: 'voice-commands',
                title: 'Voice Commands',
                content: 'VaaniSewa responds to voice commands. Try saying "help" to see available commands.',
                target: '.listening-status',
                action: 'voice-demo'
            },
            {
                id: 'navigation',
                title: 'Voice Navigation',
                content: 'Navigate between screens using voice commands like "settings", "help", or "home".',
                target: '.dashboard-actions',
                action: 'navigation-demo'
            },
            {
                id: 'volume-control',
                title: 'Volume Control',
                content: 'Adjust voice feedback volume by saying "volume up" or "volume down", or use these controls.',
                target: '.volume-control',
                action: 'volume-demo'
            },
            {
                id: 'language-toggle',
                title: 'Language Support',
                content: 'Switch between English and Hindi using this button or by saying "change language".',
                target: '#languageToggle',
                action: 'language-demo'
            },
            {
                id: 'help-system',
                title: 'Getting Help',
                content: 'Click the help button (?) on any screen for contextual assistance, or say "help" anytime.',
                target: '.help-button',
                action: 'help-demo'
            }
        ];
        this.init();
    }

    init() {
        this.createWizardInterface();
        this.setupEventListeners();
    }

    createWizardInterface() {
        const wizardHTML = `
            <div id="onboardingWizard" class="onboarding-wizard">
                <div class="wizard-overlay"></div>
                <div class="wizard-content">
                    <div class="wizard-header">
                        <div class="wizard-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="wizardProgress"></div>
                            </div>
                            <span class="progress-text">
                                <span id="currentStepNum">1</span> of <span id="totalStepsNum">${this.totalSteps}</span>
                            </span>
                        </div>
                        <button class="wizard-close" id="closeWizard" aria-label="Close wizard">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="wizard-body">
                        <div class="wizard-icon">
                            <i class="fas fa-magic" id="wizardIcon"></i>
                        </div>
                        <h2 id="wizardTitle">Welcome to VaaniSewa!</h2>
                        <p id="wizardContent">Let's get you started with voice-powered accessibility.</p>
                        
                        <div class="wizard-demo-area" id="wizardDemoArea">
                            <!-- Dynamic demo content will be inserted here -->
                        </div>
                    </div>
                    
                    <div class="wizard-footer">
                        <button class="btn btn-secondary" id="wizardSkip">Skip Tutorial</button>
                        <div class="wizard-navigation">
                            <button class="btn btn-secondary" id="wizardPrev" disabled>
                                <i class="fas fa-arrow-left"></i> Previous
                            </button>
                            <button class="btn btn-primary" id="wizardNext">
                                Next <i class="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="wizard-spotlight" id="wizardSpotlight"></div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', wizardHTML);
    }

    setupEventListeners() {
        document.getElementById('wizardNext').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('wizardPrev').addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('wizardSkip').addEventListener('click', () => {
            this.skipWizard();
        });

        document.getElementById('closeWizard').addEventListener('click', () => {
            this.closeWizard();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            if (e.key === 'Escape') {
                this.closeWizard();
            } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                this.nextStep();
            } else if (e.key === 'ArrowLeft') {
                this.previousStep();
            }
        });
    }

    start() {
        this.isActive = true;
        this.currentStep = 0;
        document.getElementById('onboardingWizard').classList.add('active');
        this.showStep(0);
        this.speak('Welcome to VaaniSewa! Let\'s start your onboarding journey.');
        
        // Mark user as onboarded
        localStorage.setItem('vaanisewa-onboarded', 'false');
    }

    showStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.steps.length) return;

        const step = this.steps[stepIndex];
        this.currentStep = stepIndex;

        // Update UI
        document.getElementById('wizardTitle').textContent = step.title;
        document.getElementById('wizardContent').textContent = step.content;
        document.getElementById('currentStepNum').textContent = stepIndex + 1;
        document.getElementById('wizardIcon').className = this.getStepIcon(step.id);

        // Update progress
        const progress = ((stepIndex + 1) / this.totalSteps) * 100;
        document.getElementById('wizardProgress').style.width = `${progress}%`;

        // Update navigation buttons
        document.getElementById('wizardPrev').disabled = stepIndex === 0;
        const nextBtn = document.getElementById('wizardNext');
        if (stepIndex === this.totalSteps - 1) {
            nextBtn.innerHTML = 'Finish <i class="fas fa-check"></i>';
        } else {
            nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
        }

        // Highlight target element
        this.highlightTarget(step.target);

        // Execute step action
        this.executeStepAction(step);

        // Speak step content
        this.speak(step.content);
    }

    getStepIcon(stepId) {
        const icons = {
            'welcome': 'fas fa-hand-wave',
            'voice-commands': 'fas fa-microphone',
            'navigation': 'fas fa-compass',
            'volume-control': 'fas fa-volume-up',
            'language-toggle': 'fas fa-language',
            'help-system': 'fas fa-question-circle'
        };
        return icons[stepId] || 'fas fa-magic';
    }

    highlightTarget(selector) {
        // Remove previous highlights
        document.querySelectorAll('.wizard-highlight').forEach(el => {
            el.classList.remove('wizard-highlight');
        });

        if (selector) {
            const target = document.querySelector(selector);
            if (target) {
                target.classList.add('wizard-highlight');
                this.positionSpotlight(target);
            }
        } else {
            this.hideSpotlight();
        }
    }

    positionSpotlight(element) {
        const spotlight = document.getElementById('wizardSpotlight');
        const rect = element.getBoundingClientRect();
        
        spotlight.style.display = 'block';
        spotlight.style.left = `${rect.left - 10}px`;
        spotlight.style.top = `${rect.top - 10}px`;
        spotlight.style.width = `${rect.width + 20}px`;
        spotlight.style.height = `${rect.height + 20}px`;
    }

    hideSpotlight() {
        document.getElementById('wizardSpotlight').style.display = 'none';
    }

    executeStepAction(step) {
        const demoArea = document.getElementById('wizardDemoArea');
        
        switch (step.action) {
            case 'introduction':
                demoArea.innerHTML = `
                    <div class="demo-welcome">
                        <div class="demo-features">
                            <div class="demo-feature">
                                <i class="fas fa-microphone"></i>
                                <span>Voice Commands</span>
                            </div>
                            <div class="demo-feature">
                                <i class="fas fa-universal-access"></i>
                                <span>Accessibility</span>
                            </div>
                            <div class="demo-feature">
                                <i class="fas fa-language"></i>
                                <span>Bilingual Support</span>
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'voice-demo':
                demoArea.innerHTML = `
                    <div class="demo-voice">
                        <button class="demo-mic-btn" onclick="onboardingWizard.demoVoiceCommand()">
                            <i class="fas fa-microphone"></i>
                            Try saying "help"
                        </button>
                        <div class="demo-commands">
                            <div class="demo-command">"help" - Show help</div>
                            <div class="demo-command">"settings" - Open settings</div>
                            <div class="demo-command">"volume up" - Increase volume</div>
                        </div>
                    </div>
                `;
                break;

            case 'navigation-demo':
                demoArea.innerHTML = `
                    <div class="demo-navigation">
                        <div class="demo-nav-buttons">
                            <button class="demo-nav-btn" onclick="onboardingWizard.demoNavigation('settings')">
                                <i class="fas fa-cog"></i> Settings
                            </button>
                            <button class="demo-nav-btn" onclick="onboardingWizard.demoNavigation('help')">
                                <i class="fas fa-question-circle"></i> Help
                            </button>
                        </div>
                        <p class="demo-hint">Try clicking or use voice commands</p>
                    </div>
                `;
                break;

            case 'volume-demo':
                demoArea.innerHTML = `
                    <div class="demo-volume">
                        <div class="demo-volume-controls">
                            <button class="demo-volume-btn" onclick="onboardingWizard.demoVolume('down')">
                                <i class="fas fa-volume-down"></i>
                            </button>
                            <div class="demo-volume-bar">
                                <div class="demo-volume-fill" id="demoVolumeFill"></div>
                            </div>
                            <button class="demo-volume-btn" onclick="onboardingWizard.demoVolume('up')">
                                <i class="fas fa-volume-up"></i>
                            </button>
                        </div>
                        <p class="demo-hint">Say "volume up" or "volume down"</p>
                    </div>
                `;
                this.updateDemoVolume();
                break;

            case 'language-demo':
                demoArea.innerHTML = `
                    <div class="demo-language">
                        <button class="demo-lang-btn" onclick="onboardingWizard.demoLanguage()">
                            <i class="fas fa-language"></i>
                            <span id="demoLangText">Switch to Hindi</span>
                        </button>
                        <div class="demo-lang-examples">
                            <div class="demo-lang-example">
                                <strong>English:</strong> "help" → Help screen
                            </div>
                            <div class="demo-lang-example">
                                <strong>Hindi:</strong> "सहायता" → Help screen
                            </div>
                        </div>
                    </div>
                `;
                break;

            case 'help-demo':
                demoArea.innerHTML = `
                    <div class="demo-help">
                        <button class="demo-help-btn" onclick="onboardingWizard.demoHelp()">
                            <i class="fas fa-question-circle"></i>
                            Try the Help System
                        </button>
                        <div class="demo-help-features">
                            <div class="demo-help-feature">
                                <i class="fas fa-mouse-pointer"></i>
                                <span>Click ? for tooltips</span>
                            </div>
                            <div class="demo-help-feature">
                                <i class="fas fa-microphone"></i>
                                <span>Voice-narrated help</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
        }
    }

    // Demo interaction methods
    demoVoiceCommand() {
        this.speak('Voice command recognized! You can say help, settings, volume up, volume down, and many more commands.');
        this.showDemoFeedback('Voice command demo completed!');
    }

    demoNavigation(screen) {
        this.speak(`Navigating to ${screen}. You can use voice commands or buttons to navigate.`);
        this.showDemoFeedback(`Navigation to ${screen} demonstrated!`);
    }

    demoVolume(direction) {
        const currentVolume = this.app.volume || 0.7;
        const newVolume = direction === 'up' ? 
            Math.min(1, currentVolume + 0.1) : 
            Math.max(0, currentVolume - 0.1);
        
        this.updateDemoVolume(newVolume);
        this.speak(`Volume ${direction === 'up' ? 'increased' : 'decreased'} to ${Math.round(newVolume * 100)} percent`);
    }

    updateDemoVolume(volume = null) {
        const currentVolume = volume || this.app.volume || 0.7;
        const fill = document.getElementById('demoVolumeFill');
        if (fill) {
            fill.style.width = `${currentVolume * 100}%`;
        }
    }

    demoLanguage() {
        const langText = document.getElementById('demoLangText');
        const isEnglish = langText.textContent.includes('Hindi');
        
        if (isEnglish) {
            langText.textContent = 'Switch to English';
            this.speak('भाषा हिंदी में बदल गई। अब आप हिंदी में आवाज कमांड का उपयोग कर सकते हैं।');
        } else {
            langText.textContent = 'Switch to Hindi';
            this.speak('Language switched to English. You can now use voice commands in English.');
        }
    }

    demoHelp() {
        this.speak('Help system activated! The question mark button provides contextual help for any screen element.');
        this.showDemoFeedback('Help system demonstrated!');
    }

    showDemoFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'demo-feedback';
        feedback.textContent = message;
        
        const demoArea = document.getElementById('wizardDemoArea');
        demoArea.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }

    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.showStep(this.currentStep + 1);
        } else {
            this.completeWizard();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    completeWizard() {
        localStorage.setItem('vaanisewa-onboarded', 'true');
        this.speak('Onboarding completed! You\'re now ready to use VaaniSewa. Remember, you can always say "help" for assistance.');
        this.closeWizard();
        
        // Show completion message
        this.showCompletionMessage();
    }

    showCompletionMessage() {
        const completion = document.createElement('div');
        completion.className = 'onboarding-completion';
        completion.innerHTML = `
            <div class="completion-content">
                <div class="completion-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>Onboarding Complete!</h3>
                <p>You're now ready to use VaaniSewa. Remember to use voice commands or click the ? button for help.</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Get Started
                </button>
            </div>
        `;
        
        document.body.appendChild(completion);
        
        setTimeout(() => {
            completion.remove();
        }, 5000);
    }

    skipWizard() {
        if (confirm('Are you sure you want to skip the tutorial? You can always access help later.')) {
            localStorage.setItem('vaanisewa-onboarded', 'true');
            this.speak('Tutorial skipped. You can access help anytime by saying "help" or clicking the question mark button.');
            this.closeWizard();
        }
    }

    closeWizard() {
        this.isActive = false;
        document.getElementById('onboardingWizard').classList.remove('active');
        
        // Remove highlights
        document.querySelectorAll('.wizard-highlight').forEach(el => {
            el.classList.remove('wizard-highlight');
        });
        
        this.hideSpotlight();
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

    // Check if user needs onboarding
    static shouldShowOnboarding() {
        return localStorage.getItem('vaanisewa-onboarded') !== 'true';
    }

    // Reset onboarding (for testing or re-onboarding)
    static resetOnboarding() {
        localStorage.removeItem('vaanisewa-onboarded');
    }
}

// Export for global use
window.OnboardingWizard = OnboardingWizard;