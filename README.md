# FRIDAY - Voice AI Assistant

A JARVIS/Friday-style voice assistant with web interface and local AI.

## Features

✨ **Voice Interface** - Say "Hey Friday" to start

🧠 **Smart Brain** - Uses Ollama (free, local AI)

🔢 **Exact Math** - Pattern finder, Pi calculator

⚖️ **Decision Helper** - Weighted scoring for tough choices

🎨 **Beautiful Web UI** - Modern dark theme interface

---

## Quick Start (Choose One)

### Option 1: Web Version (Browser Only)
1. Open **`friday_preview.html`** in your browser
2. Get free API key from [console.anthropic.com](https://console.anthropic.com)
3. Paste key when prompted
4. Start chatting!

### Option 2: Full Version (Voice + Local AI)

#### Step 1: Install Ollama
- Download from [ollama.com](https://ollama.com)
- Run: `ollama pull llama3.2`
- Run: `ollama serve` (keep this window open)

#### Step 2: Install Python Packages
```bash
pip install -r requirements-backend.txt
pip install SpeechRecognition pyttsx3 pyaudio
```

If `pyaudio` fails on Windows, try:
```bash
pip install pipwin
pipwin install pyaudio
```

#### Step 3: Start Backend Server
```bash
python server.py
```

#### Step 4: Open Web Interface
Open **`index.html`** in your browser and start using Friday!

---

## Usage

### Voice Commands
- **"Hey Friday"** - Wake word
- **"What's 2+2?"** - Math questions
- **"Find pattern: 2, 4, 6, 8"** - Pattern detection
- **"Help me decide between A and B"** - Decision helper
- **"Friday, stop listening"** - Exit

### Text Commands
Just type in the text box or use the quick action buttons:
- 📊 Find Pattern
- π Calculate Pi
- ⚖️ Help Decide

---

## Files

| File | Purpose |
|------|----------|
| `index.html` | Main web interface |
| `style.css` | Styling |
| `script.js` | Frontend logic |
| `server.py` | Backend API server |
| `friday_preview.html` | Browser-only text preview |
| `friday.py` | Original voice-only Python version |

---

## Troubleshooting

### "Cannot connect to Ollama"
- Make sure `ollama serve` is running in another terminal

### Microphone not working
- Check browser permissions (allow microphone access)
- On Windows, install `pipwin` and use it for pyaudio

### API Key errors
- Get a free key from [console.anthropic.com](https://console.anthropic.com)
- Make sure you have some credit loaded

### Server won't start
- Check port 5000 isn't already in use
- Try: `python server.py`

---

## Architecture

```
Browser (Web UI)
     ↓
  index.html + script.js
     ↓
  http://localhost:5000
     ↓
  server.py (Flask)
     ↓
  http://localhost:11434
     ↓
  Ollama (Local AI)
```

---

## License

Free to use and modify.

---

**Made with ❤️ for Friday fans everywhere**
