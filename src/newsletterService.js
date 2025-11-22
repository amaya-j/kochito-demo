/**
 * Main service that orchestrates newsletter generation
 */

class NewsletterService {
  constructor(newsletterGenerator, htmlRenderer, storage, smsHandler) {
    this.newsletterGenerator = newsletterGenerator;
    this.htmlRenderer = htmlRenderer;
    this.storage = storage;
    this.smsHandler = smsHandler;
  }

  async processCommand(from, topic, tone) {
    console.log(`[NewsletterService] Processing command from ${from}: topic="${topic}", tone="${tone}"`);

    try {
      // Validate topic
      if (!topic || topic.trim().length === 0) {
        await this.smsHandler.sendError(from, 'Topic is required. Format: newsletter: topic = your topic');
        return { success: false, error: 'Missing topic' };
      }

      // Generate newsletter content
      console.log(`[NewsletterService] Generating newsletter...`);
      const newsletter = await this.newsletterGenerator.generate(topic, tone);
      
      // Render HTML
      console.log(`[NewsletterService] Rendering HTML...`);
      const html = this.htmlRenderer.renderNewsletter(newsletter, topic);
      
      // Save and get URL
      console.log(`[NewsletterService] Saving newsletter...`);
      const { url } = await this.storage.saveNewsletter(html);
      
      // Send SMS with URL
      console.log(`[NewsletterService] Sending SMS with URL: ${url}`);
      await this.smsHandler.sendNewsletterReady(from, topic, url);
      
      console.log(`[NewsletterService] Successfully processed newsletter for ${from}`);
      return { success: true, url, topic };
    } catch (error) {
      console.error(`[NewsletterService] Error processing command:`, error);
      await this.smsHandler.sendError(from, error.message || 'Failed to generate newsletter. Please try again.');
      return { success: false, error: error.message };
    }
  }
}

module.exports = NewsletterService;

