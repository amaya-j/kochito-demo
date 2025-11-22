/**
 * Simple phone number storage system
 */

const fs = require('fs').promises;
const path = require('path');

class PhoneStorage {
  constructor(storagePath) {
    this.storagePath = storagePath;
    this.ensureStorageFile();
  }

  async ensureStorageFile() {
    try {
      await fs.access(this.storagePath);
    } catch (error) {
      // File doesn't exist, create it with empty array
      await fs.writeFile(this.storagePath, JSON.stringify([], null, 2), 'utf8');
    }
  }

  async getAllPhones() {
    try {
      const data = await fs.readFile(this.storagePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading phone storage:', error);
      return [];
    }
  }

  async addPhone(phoneNumber) {
    const phones = await this.getAllPhones();
    
    // Check if already exists
    if (phones.includes(phoneNumber)) {
      return { success: false, message: 'Phone number already registered' };
    }

    phones.push(phoneNumber);
    await fs.writeFile(this.storagePath, JSON.stringify(phones, null, 2), 'utf8');
    
    return { success: true, message: 'Phone number registered successfully' };
  }

  async isRegistered(phoneNumber) {
    const phones = await this.getAllPhones();
    return phones.includes(phoneNumber);
  }

  async removePhone(phoneNumber) {
    const phones = await this.getAllPhones();
    const filtered = phones.filter(p => p !== phoneNumber);
    await fs.writeFile(this.storagePath, JSON.stringify(filtered, null, 2), 'utf8');
    return { success: true };
  }
}

module.exports = PhoneStorage;

