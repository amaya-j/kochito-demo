/**
 * Generates newsletter content using OpenAI API
 */

const OpenAI = require('openai');

class NewsletterGenerator {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async generate(topic, tone = 'neutral') {
    const toneDescription = this.getToneDescription(tone);
    
    const prompt = `Write a short mini-newsletter on the topic "${topic}" in a ${toneDescription} tone.

Requirements:
- Title: One engaging line
- Introduction: 1-2 sentences setting the context
- Body: 2-3 bullet points or mini-sections with brief headings
- Optional closing: A brief call-to-action or sign-off

Total length: 250-400 words. Keep it concise, informative, and engaging.

Format the response as:
TITLE: [title here]

INTRO: [introduction here]

SECTION 1: [heading]
[content]

SECTION 2: [heading]
[content]

SECTION 3: [heading] (optional)
[content]

CLOSING: [closing line]`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a newsletter writer who creates concise, engaging mini-newsletters. Always follow the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      });

      const content = completion.choices[0].message.content;
      return this.parseNewsletter(content, topic);
    } catch (error) {
      console.error('Error generating newsletter:', error);
      throw new Error('Failed to generate newsletter. Please try again.');
    }
  }

  getToneDescription(tone) {
    const toneMap = {
      'casual': 'casual and conversational',
      'playful': 'playful and lighthearted',
      'formal': 'formal and professional',
      'neutral': 'neutral and balanced',
      'informal': 'informal and friendly',
      'professional': 'professional and authoritative'
    };
    return toneMap[tone.toLowerCase()] || 'neutral and balanced';
  }

  parseNewsletter(content, topic) {
    const sections = {
      title: '',
      intro: '',
      sections: [],
      closing: ''
    };

    // Extract title - try multiple patterns
    let titleMatch = content.match(/TITLE:\s*(.+?)(?=\n\n|INTRO:|$)/i);
    if (!titleMatch) {
      // Try without colon
      titleMatch = content.match(/^TITLE\s+(.+?)(?=\n\n|INTRO:|$)/im);
    }
    if (titleMatch) {
      sections.title = titleMatch[1].trim();
    } else {
      // Fallback: use first line or topic
      const firstLine = content.split('\n')[0].trim();
      sections.title = firstLine.length > 0 && firstLine.length < 100 
        ? firstLine 
        : `Newsletter: ${topic}`;
    }

    // Extract intro
    let introMatch = content.match(/INTRO:\s*(.+?)(?=\n\n(SECTION|CLOSING:)|$)/is);
    if (!introMatch) {
      introMatch = content.match(/INTRODUCTION:\s*(.+?)(?=\n\n(SECTION|CLOSING:)|$)/is);
    }
    if (introMatch) {
      sections.intro = introMatch[1].trim();
    } else if (sections.sections.length === 0) {
      // If no sections found yet, try to extract intro from beginning
      const lines = content.split('\n');
      let introStart = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^(INTRO|INTRODUCTION|SECTION)/i)) {
          introStart = i;
          break;
        }
      }
      if (introStart > 0) {
        sections.intro = lines.slice(1, introStart).join(' ').trim();
      }
    }

    // Extract sections
    const sectionMatches = content.matchAll(/SECTION\s+\d+:\s*(.+?)(?=\n\n(SECTION|CLOSING:)|$)/gis);
    for (const match of sectionMatches) {
      const sectionText = match[1].trim();
      const lines = sectionText.split('\n').filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const heading = lines[0];
        const body = lines.slice(1).join('\n').trim() || lines[0]; // Use heading as body if no body
        sections.sections.push({ heading, body });
      }
    }

    // If no sections found with standard format, try alternative patterns
    if (sections.sections.length === 0) {
      // Try to find headings with ## or **
      const headingMatches = Array.from(content.matchAll(/(?:^|\n)(?:##\s+|#\s+|[*]{2}\s*)(.+?)(?:[*]{2}|$)/gm));
      for (let i = 0; i < headingMatches.length; i++) {
        const match = headingMatches[i];
        const heading = match[1].trim();
        const headingIndex = match.index + match[0].length;
        const nextMatch = i < headingMatches.length - 1 ? headingMatches[i + 1] : null;
        const bodyEnd = nextMatch ? nextMatch.index : content.length;
        const body = content.substring(headingIndex, bodyEnd).trim();
        if (heading && body && body.length > 10) {
          sections.sections.push({ heading, body });
        }
      }
    }

    // Ensure at least one section
    if (sections.sections.length === 0) {
      // Fallback: split content into paragraphs
      const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 20);
      if (paragraphs.length > 0) {
        sections.sections.push({
          heading: 'Overview',
          body: paragraphs.slice(0, 3).join('\n\n')
        });
      }
    }

    // Extract closing
    const closingMatch = content.match(/CLOSING:\s*(.+?)$/is);
    if (closingMatch) {
      sections.closing = closingMatch[1].trim();
    }

    return sections;
  }
}

module.exports = NewsletterGenerator;

