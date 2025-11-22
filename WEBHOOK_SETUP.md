# Twilio Webhook Setup Guide

## The Problem

If you sent an SMS to your Twilio number but nothing happened, it's likely because **Twilio can't reach your local server**.

Twilio needs a **publicly accessible URL** to send webhook requests to your server.

## Solutions

### Option 1: Use ngrok (Recommended for Testing)

ngrok creates a public tunnel to your local server:

1. **Install ngrok:**
   ```bash
   # macOS
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your server:**
   ```bash
   npm start
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL** (looks like `https://abc123.ngrok.io`)

5. **Update your .env file:**
   ```env
   BASE_URL=https://abc123.ngrok.io
   ```

6. **Configure Twilio webhook:**
   - Go to [Twilio Console → Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
   - Click on your phone number
   - Under "Messaging", set the webhook URL to:
     ```
     https://abc123.ngrok.io/sms/webhook
     ```
   - Set HTTP method to **POST**
   - Save

7. **Restart your server** (to pick up the new BASE_URL)

### Option 2: Deploy to a Public Server

Deploy your app to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS
- Any cloud provider

Then set the webhook URL to your deployed server's URL.

### Option 3: Use Twilio Studio (Alternative)

You can use Twilio Studio to handle SMS without a webhook, but this requires a different setup.

## Testing the Webhook

Once configured, test by:

1. Sending an SMS to your Twilio number: `newsletter: topic = test`
2. Check your server logs for: `[Webhook] Received SMS`
3. You should receive a reply with your newsletter link

## Verify Webhook is Working

Check your server logs. You should see:
```
[Webhook] Received SMS: { from: '+17402581804', body: 'newsletter: topic = test' }
[NewsletterService] Processing command...
```

If you don't see this, the webhook isn't configured correctly.

## Common Issues

- **"Webhook not receiving requests"**: Server not publicly accessible
- **"404 Not Found"**: Wrong webhook URL in Twilio
- **"500 Error"**: Check server logs for errors
- **"SMS sent but no reply"**: Check if newsletter generation succeeded

## Quick Test

Test the webhook manually:
```bash
curl -X POST http://localhost:3000/sms/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B17402581804&Body=newsletter%3A%20topic%20%3D%20test"
```

If this works, the issue is that Twilio can't reach your local server.

