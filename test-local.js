/**
 * Local test script to test newsletter generation without SMS
 * Usage: node test-local.js "newsletter: topic = generative AI, tone = casual"
 */

require('dotenv').config();
const NewsletterGenerator = require('./src/newsletterGenerator');
const { renderNewsletter } = require('./src/htmlRenderer');
const Storage = require('./src/storage');
const { parseCommand } = require('./src/commandParser');

async function test() {
  const args = process.argv.slice(2);
  const message = args.join(' ') || 'newsletter: topic = generative AI, tone = casual';
  
  console.log('Testing with command:', message);
  console.log('---\n');

  // Parse command
  const command = parseCommand(message);
  if (!command) {
    console.error('Invalid command format');
    process.exit(1);
  }

  console.log('Parsed command:', command);
  console.log('---\n');

  if (!command.topic) {
    console.error('Topic is required');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set in .env file');
    process.exit(1);
  }

  try {
    // Generate newsletter
    console.log('Generating newsletter...');
    const generator = new NewsletterGenerator(process.env.OPENAI_API_KEY);
    const newsletter = await generator.generate(command.topic, command.tone);
    
    console.log('Generated newsletter structure:');
    console.log('Title:', newsletter.title);
    console.log('Intro:', newsletter.intro.substring(0, 100) + '...');
    console.log('Sections:', newsletter.sections.length);
    console.log('---\n');

    // Render HTML
    console.log('Rendering HTML...');
    const html = renderNewsletter(newsletter, command.topic);
    
    // Save to storage
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    const storage = new Storage(
      process.env.STORAGE_PATH || './storage/newsletters',
      BASE_URL
    );
    
    const { url, filePath } = await storage.saveNewsletter(html);
    console.log('Newsletter saved!');
    console.log('URL:', url);
    console.log('File path:', filePath);
    console.log('\n✅ Test successful!');
    console.log('\nTo view the newsletter, start the server and visit:', url);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

test();

