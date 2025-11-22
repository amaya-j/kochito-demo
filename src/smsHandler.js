/**
 * Handles SMS sending via Twilio
 */

const twilio = require('twilio');

class SMSHandler {
  constructor(accountSid, authToken, fromNumber) {
    if (accountSid && authToken && fromNumber) {
      this.client = twilio(accountSid, authToken);
      this.fromNumber = fromNumber;
      this.enabled = true;
    } else {
      console.warn('Twilio credentials not provided. SMS sending disabled.');
      this.enabled = false;
    }
  }

  async send(to, message) {
    if (!this.enabled) {
      console.log(`[SMS] Would send to ${to}: ${message}`);
      return { success: true, mock: true };
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to
      });
      console.log(`[SMS] Message sent - SID: ${result.sid}, Status: ${result.status}, To: ${to}`);
      return { success: true, sid: result.sid, status: result.status };
    } catch (error) {
      console.error('[SMS] Error sending SMS:', error.message, error.code);
      if (error.code === 21211) {
        throw new Error('Invalid phone number format');
      } else if (error.code === 21608) {
        throw new Error('Phone number not verified (Trial account restriction)');
      } else if (error.code === 21408) {
        throw new Error('Permission denied - check Twilio account permissions');
      }
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  async sendNewsletterReady(to, topic, url) {
    const message = `Your newsletter on "${topic}" is ready: ${url}`;
    return this.send(to, message);
  }

  async sendError(to, errorMessage) {
    const message = `Error: ${errorMessage}`;
    return this.send(to, message);
  }
}

module.exports = SMSHandler;

