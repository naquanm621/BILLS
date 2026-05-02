// src/services/ocr.service.js
const Tesseract = require('tesseract.js');
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

class OcrService {
  static async extractText(filePath) {
    const extension = path.extname(filePath).toLowerCase();

    try {
      if (extension === '.pdf') {
        console.log("--- Extracting text from PDF ---");
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
      } else {
        console.log("--- Extracting text from Image ---");
        const result = await Tesseract.recognize(filePath, 'eng');
        return result.data.text;
      }
    } catch (err) {
      console.error('Extraction error:', err);
      return null;
    }
  }
}

module.exports = OcrService;
