/**
 * Renders newsletter content into a clean, mobile-friendly HTML page
 */

function renderNewsletter(newsletter, topic) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const sectionsHtml = newsletter.sections.map(section => `
    <div class="section">
      <h2>${escapeHtml(section.heading)}</h2>
      ${formatParagraphs(section.body)}
    </div>
  `).join('');

  const closingHtml = newsletter.closing 
    ? `<div class="closing"><p>${escapeHtml(newsletter.closing)}</p></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(newsletter.title)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 28px;
      margin-bottom: 10px;
      color: #222;
      line-height: 1.3;
    }
    .meta {
      font-size: 14px;
      color: #666;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    .intro {
      font-size: 16px;
      margin-bottom: 25px;
      color: #444;
    }
    .section {
      margin-bottom: 25px;
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 10px;
      color: #333;
    }
    .section p {
      font-size: 16px;
      color: #555;
      margin-bottom: 10px;
    }
    .closing {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 16px;
      color: #666;
      font-style: italic;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .container {
        padding: 20px;
      }
      h1 {
        font-size: 24px;
      }
      .section h2 {
        font-size: 18px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(newsletter.title)}</h1>
    <div class="meta">
      ${dateStr} at ${timeStr}
    </div>
    <div class="intro">
      <p>${escapeHtml(newsletter.intro)}</p>
    </div>
    ${sectionsHtml}
    ${closingHtml}
  </div>
</body>
</html>`;
}

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatParagraphs(text) {
  if (!text) return '<p></p>';
  // Split by double newlines and format as paragraphs
  const paragraphs = text
    .split(/\n\n+/)
    .map(para => para.trim().replace(/\n/g, ' ')) // Replace single newlines with spaces
    .filter(para => para.length > 0)
    .map(para => `<p>${escapeHtml(para)}</p>`);
  
  return paragraphs.length > 0 ? paragraphs.join('') : '<p></p>';
}

module.exports = { renderNewsletter };

