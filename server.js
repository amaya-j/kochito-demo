/**
 * Main server for Kochi.to newsletter SMS service
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const { parseCommand } = require('./src/commandParser');
const NewsletterGenerator = require('./src/newsletterGenerator');
const { renderNewsletter } = require('./src/htmlRenderer');
const Storage = require('./src/storage');
const SMSHandler = require('./src/smsHandler');
const NewsletterService = require('./src/newsletterService');
const PhoneStorage = require('./src/phoneStorage');

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (signup page)
app.use(express.static('public'));

// Initialize services
const newsletterGenerator = new NewsletterGenerator(process.env.OPENAI_API_KEY);
const storage = new Storage(
  process.env.STORAGE_PATH || './storage/newsletters',
  BASE_URL
);
const smsHandler = new SMSHandler(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
  process.env.TWILIO_PHONE_NUMBER
);
const phoneStorage = new PhoneStorage(
  process.env.PHONE_STORAGE_PATH || './storage/phones.json'
);
const newsletterService = new NewsletterService(
  newsletterGenerator,
  { renderNewsletter },
  storage,
  smsHandler
);

// Signup API endpoint
app.post('/api/signup', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Validate phone format
    if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
      return res.status(400).json({ error: 'Invalid phone number format. Include country code (e.g., +1234567890)' });
    }

    // Check if already registered
    const isRegistered = await phoneStorage.isRegistered(phone);
    let shouldSendWelcome = false;
    
    if (!isRegistered) {
      // Add phone to storage
      const result = await phoneStorage.addPhone(phone);
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      shouldSendWelcome = true;
    } else {
      // Already registered, but send welcome message anyway
      shouldSendWelcome = true;
    }

    // Send welcome SMS
    const welcomeMessage = `Welcome to Kochi.to Newsletter! 📰

To generate a newsletter, text:
newsletter: topic = your topic

Examples:
• newsletter: topic = AI, tone = casual
• newsletter: topic = crypto, tone = professional
• newsletter: topic = climate change

You'll receive a shareable link to your newsletter!`;

    // Send welcome SMS if needed
    if (shouldSendWelcome) {
      let smsSent = false;
      let smsError = null;
      let smsSid = null;
      try {
        const smsResult = await smsHandler.send(phone, welcomeMessage);
        if (smsResult.success && !smsResult.mock) {
          smsSent = true;
          smsSid = smsResult.sid;
          console.log(`[Signup] Welcome SMS sent to ${phone} (SID: ${smsResult.sid || 'N/A'}, Status: ${smsResult.status || 'N/A'})`);
          
          // Check status after a moment if it's queued
          if (smsResult.status === 'queued') {
            // Message is queued, might take a moment
            setTimeout(async () => {
              try {
                const twilio = require('twilio');
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                const msg = await client.messages(smsResult.sid).fetch();
                console.log(`[Signup] SMS status check for ${phone}: ${msg.status} (Error: ${msg.errorCode || 'none'})`);
              } catch (e) {
                // Ignore status check errors
              }
            }, 5000);
          }
        } else if (smsResult.mock) {
          console.log(`[Signup] SMS mock mode - would send to ${phone}`);
          smsError = 'SMS sending is disabled (Twilio not configured)';
        }
      } catch (error) {
        smsError = error.message || 'Unknown error';
        console.error(`[Signup] Failed to send welcome SMS to ${phone}:`, error);
      }

      if (smsError) {
        return res.status(200).json({ 
          success: true, 
          message: isRegistered ? 'Welcome message failed to send. You are already registered. Try sending a newsletter command directly.' : 'Signup successful, but SMS failed to send. You can still send newsletter commands via SMS.',
          warning: smsError,
          smsSid: smsSid
        });
      }
    }

    res.json({ 
      success: true, 
      message: isRegistered ? 'You are already registered! Welcome message sent.' : 'Signup successful! Check your phone for instructions.' 
    });
  } catch (error) {
    console.error('[Signup] Error:', error);
    res.status(500).json({ error: 'Failed to process signup' });
  }
});

// SMS Webhook endpoint (Twilio)
app.post('/sms/webhook', async (req, res) => {
  console.log('[Webhook] Received SMS:', {
    from: req.body.From,
    body: req.body.Body
  });

  try {
    const from = req.body.From;
    const message = req.body.Body;

    // Check if user is registered (optional - allow anyone to use)
    const isRegistered = await phoneStorage.isRegistered(from);
    if (!isRegistered) {
      // Auto-register them and send welcome message
      await phoneStorage.addPhone(from);
      const welcomeMessage = `Welcome to Kochi.to Newsletter! 📰

To generate a newsletter, text:
newsletter: topic = your topic

Examples:
• newsletter: topic = AI, tone = casual
• newsletter: topic = crypto, tone = professional

You'll receive a shareable link!`;
      await smsHandler.send(from, welcomeMessage);
    }

    // Parse command
    const command = parseCommand(message);
    
    if (!command) {
      // Not a newsletter command, send helpful message
      await smsHandler.send(from, 'Send "newsletter: topic = your topic" to generate a newsletter!\n\nExample: newsletter: topic = AI, tone = casual');
      return res.status(200).send('OK');
    }

    if (!command.topic) {
      await smsHandler.sendError(from, 'Topic is required. Format: newsletter: topic = your topic');
      return res.status(200).send('OK');
    }

    // Process newsletter generation
    const result = await newsletterService.processCommand(from, command.topic, command.tone);
    
    // Log the result for debugging
    if (result && result.url) {
      console.log(`[Webhook] Newsletter generated successfully: ${result.url}`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('[Webhook] Error:', error);
    res.status(500).send('Error processing request');
  }
});

// Serve newsletter HTML pages
app.get('/n/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const html = await storage.getNewsletter(id);
    if (!html) {
      return res.status(404).send('Newsletter not found');
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('[GET /n/:id] Error:', error);
    res.status(500).send('Error retrieving newsletter');
  }
});

// Web-based newsletter generation (bypasses SMS)
app.post('/api/generate', async (req, res) => {
  try {
    const { topic, tone = 'neutral' } = req.body;

    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    console.log(`[API] Generating newsletter via web: topic="${topic}", tone="${tone}"`);

    // Generate newsletter
    const newsletter = await newsletterGenerator.generate(topic, tone);
    
    // Render HTML
    const html = renderNewsletter(newsletter, topic);
    
    // Save and get URL
    const { url } = await storage.saveNewsletter(html);
    
    console.log(`[API] Newsletter generated: ${url}`);

    res.json({ 
      success: true, 
      url,
      title: newsletter.title,
      topic 
    });
  } catch (error) {
    console.error('[API] Error generating newsletter:', error);
    res.status(500).json({ error: error.message || 'Failed to generate newsletter' });
  }
});

// List all newsletters
app.get('/api/newsletters', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const storagePath = process.env.STORAGE_PATH || './storage/newsletters';
    const files = await fs.readdir(storagePath);
    
    const htmlFiles = files.filter(f => f.endsWith('.html'));
    const newsletters = await Promise.all(
      htmlFiles.map(async (file) => {
        const id = file.replace('.html', '');
        const filePath = path.join(storagePath, file);
        const stats = await fs.stat(filePath);
        
        // Extract title from HTML
        const content = await fs.readFile(filePath, 'utf8');
        const titleMatch = content.match(/<title>(.+?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : 'Untitled Newsletter';
        
        return {
          id,
          title,
          url: `${BASE_URL}/n/${id}`,
          created: stats.birthtime || stats.mtime
        };
      })
    );

    // Sort by creation date, newest first
    newsletters.sort((a, b) => new Date(b.created) - new Date(a.created));

    res.json({ 
      success: true, 
      newsletters 
    });
  } catch (error) {
    console.error('[API] Error listing newsletters:', error);
    res.status(500).json({ error: 'Failed to list newsletters' });
  }
});

// Root - show signup page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'kochito-newsletter' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kochi.to Newsletter Service running on port ${PORT}`);
  console.log(`🌐 Signup page: ${BASE_URL}/`);
  console.log(`📱 SMS webhook: ${BASE_URL}/sms/webhook`);
  console.log(`📄 Newsletter URLs: ${BASE_URL}/n/:id`);
  console.log(`\n⚠️  Make sure to set up your .env file with:`);
  console.log(`   - OPENAI_API_KEY`);
  console.log(`   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER`);
});

