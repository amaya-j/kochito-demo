# SMS Troubleshooting Guide

## Issue: Not Receiving SMS Messages

If you're not receiving SMS messages, here are common causes and solutions:

### 1. Twilio Trial Account Restrictions

**Error Codes: 30044, 30032**

Twilio trial accounts have limitations:
- You can only send SMS to **verified phone numbers**
- Messages include a "Sent from your Twilio trial account" prefix
- Some carriers may filter or block trial account messages

**Solutions:**
- Verify your phone number in [Twilio Console](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
- Upgrade to a paid Twilio account for better delivery
- Check if your carrier is blocking the messages

### 2. Phone Number Format

Make sure your phone number includes the country code:
- ✅ Correct: `+17402581804`
- ❌ Wrong: `7402581804` or `17402581804`

### 3. Carrier Filtering

Some carriers filter messages from trial accounts or unknown numbers. Try:
- Checking your spam/blocked messages folder
- Contacting your carrier to whitelist the Twilio number
- Using a different phone number to test

### 4. Message Status Check

You can check message status in Twilio Console:
1. Go to [Twilio Console → Messaging → Logs](https://console.twilio.com/us1/monitor/logs/sms)
2. Find your message by SID or phone number
3. Check the status and error code

### 5. Alternative: Use the Service Directly

Even if welcome SMS fails, you can still use the service:
1. Send an SMS directly to your Twilio number: `newsletter: topic = AI, tone = casual`
2. You should receive the newsletter link via SMS

### 6. Upgrade Twilio Account

For production use, consider upgrading:
- Better delivery rates
- No "trial account" message prefix
- Can send to any number
- More reliable delivery

[View Twilio Pricing](https://www.twilio.com/pricing)

## Testing SMS Delivery

To test if SMS is working:

```bash
node -e "const SMSHandler = require('./src/smsHandler'); require('dotenv').config(); const sms = new SMSHandler(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_PHONE_NUMBER); sms.send('+YOUR_NUMBER', 'Test message').then(r => console.log('Success:', r)).catch(e => console.error('Error:', e.message));"
```

## Getting Help

- Check [Twilio Support](https://support.twilio.com/)
- Review [Twilio Error Codes](https://www.twilio.com/docs/api/errors)
- Check server logs for detailed error messages

