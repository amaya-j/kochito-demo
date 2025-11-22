/**
 * Parses SMS commands for newsletter generation
 * Supports formats like:
 * - newsletter: topic = crypto
 * - newsletter: topic = RL in games, tone = playful
 */

function parseCommand(message) {
  const trimmed = message.trim();
  
  // Check if command starts with "newsletter:"
  if (!trimmed.toLowerCase().startsWith('newsletter:')) {
    return null;
  }

  // Extract the command part after "newsletter:"
  const commandPart = trimmed.substring('newsletter:'.length).trim();
  
  // Default values
  let topic = null;
  let tone = 'neutral';

  // Parse parameters
  // Handle formats like: topic = value, tone = value
  const topicMatch = commandPart.match(/topic\s*=\s*([^,]+)/i);
  if (topicMatch) {
    topic = topicMatch[1].trim();
  }

  const toneMatch = commandPart.match(/tone\s*=\s*([^,]+)/i);
  if (toneMatch) {
    tone = toneMatch[1].trim().toLowerCase();
  }

  // If no explicit topic found, try to extract it as the first part
  if (!topic && commandPart) {
    // If there's no "topic =" but there's content, use it as topic
    const beforeTone = commandPart.split(/tone\s*=/i)[0].trim();
    if (beforeTone) {
      topic = beforeTone;
    }
  }

  return {
    topic,
    tone: tone || 'neutral'
  };
}

module.exports = { parseCommand };

