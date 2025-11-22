# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Create a `.env` file in the root directory:

```env
PORT=3000
BASE_URL=http://localhost:3000

# For production, use your public URL:
# BASE_URL=https://yourdomain.com

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

OPENAI_API_KEY=sk-your-openai-api-key

STORAGE_PATH=./storage/newsletters
```

## 3. Test Locally (Without SMS)

Test the newsletter generation without setting up Twilio:

```bash
node test-local.js "newsletter: topic = generative AI, tone = casual"
```

This will:
- Generate a newsletter
- Save it to storage
- Print the URL

Then start the server and visit the URL to see the newsletter.

## 4. Start the Server

```bash
npm start
```

## 5. Configure Twilio Webhook

1. Go to your Twilio Console
2. Navigate to your phone number settings
3. Set the webhook URL to: `https://yourdomain.com/sms/webhook`
4. Set HTTP method to POST

## 6. Test via SMS

Send an SMS to your Twilio number:
```
newsletter: topic = crypto, tone = casual
```

You should receive a reply with a URL to your newsletter!

## Troubleshooting

- **No OpenAI API key**: Make sure `OPENAI_API_KEY` is set in `.env`
- **SMS not working**: Check Twilio credentials and webhook URL
- **Storage errors**: Ensure the `storage/newsletters` directory is writable
- **Port already in use**: Change `PORT` in `.env`

