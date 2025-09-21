# VaaniSewa - Voice Accessibility Web App

VaaniSewa is a comprehensive voice-controlled accessibility web application designed specifically for specially-abled users. The app provides full voice navigation, bilingual support (English/Hindi), and accessible design principles.

## 🌟 Features

### 🎤 Voice Registration & Login
- Voice command activation: "register user" / "उपयोगकर्ता पंजीकरण"
- Voice input for all form fields with dedicated microphone buttons
- Audio confirmation after successful registration/login
- Support for "login" / "लॉगिन करें" commands

### 🧭 Voice Navigation
- Complete voice control for navigation
- Commands: "home"/"होम", "settings"/"सेटिंग्स", "help"/"सहायता", "logout"/"लॉगआउट"
- Seamless screen transitions with voice feedback

### 🔊 Audio Feedback
- Text-to-speech for all interactions
- Bilingual audio feedback (English/Hindi)
- Customizable speech rate, pitch, and voice selection
- Audio confirmations for every user action

### 🌐 Language Support
- Full bilingual support (English/Hindi)
- Language toggle with persistent preferences
- Voice recognition automatically updates with language changes
- All UI elements and voice commands translated

### 🎚️ Voice Volume Control
- Voice commands: "volume up/down" / "आवाज़ बढ़ाएं/कम करें"
- Visual volume indicators
- Fine-tuning controls in settings panel

### ♿ Accessibility Features
- High contrast colors for better visibility
- Large accessible buttons (minimum 48px touch targets)
- Keyboard navigation support
- Screen reader compatibility with proper ARIA labels
- Focus indicators and semantic HTML structure
- Responsive design for all devices

## 🚀 Getting Started

### Prerequisites
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- Modern web browser with Web Speech API support (Chrome, Edge, Safari)
- Microphone access for voice commands
- Internet connection for initial setup

### Installation

1. **Clone or download the project files**
   ```bash
   cd vaanisewa-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   Or alternatively:
   ```bash
   npm start
   ```

4. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Allow microphone permissions when prompted

### Alternative Setup Methods

If you prefer not to use Node.js, you can also run the application using:

**Python:**
```bash
python -m http.server 8000
# Then open http://localhost:8000
```

**PHP:**
```bash
php -S localhost:8000
# Then open http://localhost:8000
```

**Live Server (VS Code Extension):**
- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

## 📱 Usage Instructions

### First Time Setup
1. **Allow microphone access** when prompted by the browser
2. **Wait for "Ready to listen"** status in the header
3. **Choose your preferred language** using the language toggle button

### Voice Commands

#### Authentication
- **English**: "register user", "login"
- **Hindi**: "उपयोगकर्ता पंजीकरण", "लॉगिन करें"

#### Navigation
- **English**: "home", "settings", "help", "logout"
- **Hindi**: "होम", "सेटिंग्स", "सहायता", "लॉगआउट"

#### Volume Control
- **English**: "volume up", "volume down"
- **Hindi**: "आवाज़ बढ़ाएं", "आवाज़ कम करें"

### Registration Process
1. Say "register user" or click the Register button
2. Use voice input for each field by clicking the microphone buttons
3. For disability type, say: "visual", "hearing", "mobility", "cognitive", or "other"
4. Submit the form to complete registration

### Login Process
1. Say "login" or click the Login button
2. Provide your username using voice input or typing
3. System will verify and log you in

## 🛠️ Technical Details

### Technologies Used
- **Web Speech API** for voice recognition
- **SpeechSynthesis API** for text-to-speech
- **localStorage** for data persistence
- **CSS Grid/Flexbox** for responsive layout
- **Vanilla JavaScript** for core functionality

### Browser Compatibility
- ✅ Chrome 25+ (full support)
- ✅ Edge 79+ (full support)
- ✅ Safari 14.1+ (partial support)
- ❌ Firefox (limited Web Speech API support)

### File Structure
```
vaanisewa-app/
├── index.html          # Main HTML structure
├── style.css           # Comprehensive styling with accessibility features
├── src/
│   └── main.js         # Core application logic
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables
The `.env.example` file contains templates for various API integrations:

- **Speech Services**: Google Cloud Speech, Azure Cognitive Services, AWS Polly
- **Database**: Connection strings for backend integration
- **Authentication**: JWT secrets and external auth services
- **Email**: SMTP configuration for notifications
- **Analytics**: Tracking and monitoring services

### Customization Options

#### Voice Settings
- **Speech Rate**: 0.5x to 2.0x speed
- **Speech Pitch**: 0 to 2.0 range
- **Voice Selection**: Choose from available system voices
- **Volume Control**: 0% to 100% with voice commands

#### Accessibility Settings
- High contrast mode support
- Reduced motion preferences
- Keyboard navigation
- Screen reader optimization

## 🔒 Privacy & Security

- **Local Storage**: All user data stored locally in browser
- **No External Tracking**: No analytics by default
- **Microphone Privacy**: Voice data processed locally, not transmitted
- **Data Control**: Users can clear all data anytime

## 🐛 Troubleshooting

### Common Issues

1. **Microphone not working**
   - Check browser permissions
   - Ensure HTTPS connection (required for microphone access)
   - Try refreshing the page

2. **Voice commands not recognized**
   - Speak clearly and at normal pace
   - Check if correct language is selected
   - Ensure microphone is not muted

3. **No audio feedback**
   - Check system volume settings
   - Verify browser audio permissions
   - Test with "Test Voice" button in settings

4. **Browser compatibility issues**
   - Use Chrome or Edge for best experience
   - Update browser to latest version
   - Check Web Speech API support

### Error Messages
- **"Voice recognition not supported"**: Use a compatible browser
- **"Microphone access denied"**: Allow microphone permissions
- **"Command not recognized"**: Try speaking more clearly or use button navigation

## 🤝 Contributing

We welcome contributions to improve VaaniSewa! Areas for enhancement:

- Additional language support
- Enhanced voice recognition accuracy
- Mobile app development
- Backend integration
- Advanced accessibility features

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For support and questions:
1. Check the Help section in the app
2. Review this README file
3. Test voice commands in a quiet environment
4. Ensure proper browser setup

## 🔮 Future Enhancements

- **Offline Support**: Progressive Web App capabilities
- **Multi-language**: Support for more regional languages
- **AI Integration**: Enhanced voice understanding
- **Mobile Apps**: Native iOS and Android versions
- **Backend Integration**: User accounts and data sync
- **Advanced Features**: Calendar integration, reminders, smart home control

---

**VaaniSewa** - Empowering accessibility through voice technology 🎤♿