/**
 * Handles storage and URL generation for newsletter HTML files
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Storage {
  constructor(storagePath, baseUrl) {
    this.storagePath = storagePath;
    this.baseUrl = baseUrl;
    this.ensureStorageDir();
  }

  async ensureStorageDir() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      console.error('Error creating storage directory:', error);
      throw error;
    }
  }

  async saveNewsletter(htmlContent) {
    const id = uuidv4();
    const filename = `${id}.html`;
    const filePath = path.join(this.storagePath, filename);
    
    try {
      await fs.writeFile(filePath, htmlContent, 'utf8');
      const url = `${this.baseUrl}/n/${id}`;
      return { id, url, filePath };
    } catch (error) {
      console.error('Error saving newsletter:', error);
      throw new Error('Failed to save newsletter');
    }
  }

  async getNewsletter(id) {
    const filename = `${id}.html`;
    const filePath = path.join(this.storagePath, filename);
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }
}

module.exports = Storage;

