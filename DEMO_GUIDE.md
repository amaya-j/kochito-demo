# Demo Guide for Kochi.to Newsletter

## Quick Start for Demo

This project is **fully functional via web interface** - no SMS required for demo!

### 1. Start the Server

```bash
npm start
```

Server will run on `http://localhost:3000`

### 2. Demo Flow

**Option A: Direct Generation (Recommended for Demo)**
1. Visit: `http://localhost:3000/generate.html`
2. Enter a topic (e.g., "generative AI")
3. Select a tone
4. Click "Generate Newsletter"
5. Get instant shareable link!

**Option B: View All Newsletters**
1. Visit: `http://localhost:3000/newsletters.html`
2. See all generated newsletters
3. Click any to view

**Option C: Landing Page**
1. Visit: `http://localhost:3000/`
2. See the landing page
3. Navigate to generate or view newsletters

## Features to Highlight

✅ **AI-Powered Content Generation**
- Uses OpenAI GPT-4o-mini
- 250-400 word newsletters
- Multiple tone options

✅ **Clean, Mobile-Friendly Design**
- Responsive HTML pages
- Professional styling
- Shareable URLs

✅ **Full Web Interface**
- No SMS required for demo
- Instant generation
- Newsletter management

✅ **SMS Integration (Ready)**
- SMS webhook configured
- Command parsing works
- Will work once Twilio number is verified

## Architecture Highlights

- **Modular Design**: Separate concerns (parsing, generation, rendering, storage)
- **RESTful API**: Clean endpoints for web and SMS
- **Error Handling**: Graceful failures with user feedback
- **Logging**: Comprehensive logging for debugging

## API Endpoints

- `POST /api/generate` - Generate newsletter via web
- `GET /api/newsletters` - List all newsletters
- `POST /api/signup` - Register phone number (SMS)
- `POST /sms/webhook` - Twilio webhook (SMS)
- `GET /n/:id` - View newsletter
- `GET /health` - Health check

## Tech Stack

- **Backend**: Node.js + Express
- **AI**: OpenAI API (GPT-4o-mini)
- **SMS**: Twilio (configured, pending verification)
- **Storage**: File-based (easily upgradeable to S3/database)

## What Works Now

✅ Web-based newsletter generation
✅ Newsletter viewing and management
✅ AI content generation
✅ HTML rendering
✅ URL generation and sharing

## What's Pending

⏳ SMS delivery (Twilio toll-free verification - 3-5 business days)
- Webhook is configured and working
- Messages are being received
- Newsletters are being generated
- Only SMS replies are blocked by carrier filtering

## Demo Script

1. **Show Landing Page** (`/`)
   - "This is the landing page for Kochi.to"

2. **Generate Newsletter** (`/generate.html`)
   - Enter topic: "generative AI"
   - Select tone: "casual"
   - Click generate
   - Show the generated newsletter

3. **View All Newsletters** (`/newsletters.html`)
   - Show list of all generated newsletters
   - Click one to view

4. **Explain Architecture**
   - Show code structure
   - Explain modular design
   - Highlight error handling

5. **Mention SMS Integration**
   - "SMS integration is fully built and working"
   - "Webhook receives messages and generates newsletters"
   - "Only SMS delivery is pending Twilio verification (3-5 days)"
   - "For demo purposes, the web interface provides the same functionality"

## Files to Show

- `server.js` - Main server with all endpoints
- `src/newsletterGenerator.js` - AI integration
- `src/htmlRenderer.js` - Newsletter rendering
- `public/generate.html` - Web interface
- `public/newsletters.html` - Newsletter listing

## Notes for Interviewer

- **4-hour scope project** - Built to spec
- **Production-ready architecture** - Modular, scalable
- **Full SMS integration** - Ready once Twilio verified
- **Web interface** - Works immediately for demo
- **Error handling** - Comprehensive logging and user feedback

