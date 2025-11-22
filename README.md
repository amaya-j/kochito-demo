# Kochi.to Newsletter SMS Service

A simple SMS-powered mini-newsletter generator. Text a command to generate a shareable newsletter on any topic.

## Features

- 🌐 **Web signup page** - Users can sign up with their phone number
- 📱 SMS command interface: `newsletter: topic = your topic, tone = casual`
- 🤖 AI-powered content generation (250-400 words)
- 📄 Clean, mobile-friendly HTML pages
- 🔗 Unique shareable URLs for each newsletter
- 📲 Automatic welcome SMS with instructions

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in:
   ```env
   PORT=3000
   BASE_URL=http://localhost:3000  # or your public URL
   
   # Twilio (for SMS)
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   # OpenAI (for newsletter generation)
   OPENAI_API_KEY=your_openai_api_key
   
   # Storage
   STORAGE_PATH=./storage/newsletters
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Usage

### Sign Up

1. Visit the signup page at `http://localhost:3000/` (or your domain)
2. Enter your phone number with country code (e.g., +1234567890)
3. You'll receive a welcome SMS with instructions

### SMS Commands

After signing up, send an SMS to your Twilio phone number with:

```
newsletter: topic = generative AI, tone = casual
```

**Supported formats:**
- `newsletter: topic = crypto`
- `newsletter: topic = RL in games, tone = playful`
- `newsletter: topic = climate change`

**Parameters:**
- `topic` (required): The newsletter topic
- `tone` (optional): casual, playful, formal, neutral, informal, professional (default: neutral)

### API Endpoints

- `GET /` - Signup page
- `POST /api/signup` - Register a phone number
- `POST /sms/webhook` - Twilio webhook for incoming SMS
- `GET /n/:id` - View a generated newsletter
- `GET /health` - Health check

## Architecture

- **`src/commandParser.js`** - Parses SMS commands
- **`src/newsletterGenerator.js`** - Generates content using OpenAI
- **`src/htmlRenderer.js`** - Renders HTML pages
- **`src/storage.js`** - Manages file storage and URLs
- **`src/phoneStorage.js`** - Manages registered phone numbers
- **`src/smsHandler.js`** - Handles SMS sending via Twilio
- **`src/newsletterService.js`** - Orchestrates the newsletter generation flow
- **`public/signup.html`** - Web signup page
- **`server.js`** - Main Express server

## Development

Run with auto-reload:
```bash
npm run dev
```

## Notes

- Newsletters are stored as HTML files in `./storage/newsletters/`
- Registered phone numbers are stored in `./storage/phones.json`
- Each newsletter gets a unique UUID-based URL
- The service logs all operations for debugging
- Users can sign up via web or automatically when they first send an SMS

