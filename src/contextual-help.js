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
            }
        };
        
        this.init();
    }

    init() {
        console.log('ContextualHelp initialized');
    }

    toggleHelpMode() {
        this.isActive = !this.isActive;
        console.log('Help mode toggled:', this.isActive);
    }

    explainCurrentScreen() {
        if (this.app && this.app.speak) {
            this.app.speak('This is the current screen you are viewing.');
        }
    }

    showTaskHelp() {
        if (this.app && this.app.speak) {
            this.app.speak('Here are common tasks you can perform with voice commands.');
        }
    }

    showDetailedHelp() {
        if (this.app && this.app.speak) {
            this.app.speak('VaaniSewa is a voice-controlled accessibility application.');
        }
    }
}

// Export for global use
window.ContextualHelp = ContextualHelp;