const ocrService = require('./ocr.service');
const aiService = require('./ai.service');
const billsService = require('./bills.service');

async function processBill(billId, filepath) {
  try {
    console.log(`--- Starting Brain for Bill ID: ${billId} ---`);
    const rawText = await ocrService.extractText(filepath);
    const structuredData = await aiService.analyzeText(rawText);

    await billsService.updateBillById(billId, {
      vendor: structuredData.vendor,
      amount: structuredData.amount,
      due_date: structuredData.due_date,
      status: 'processed'
    });
    console.log(`--- Brain finished for Bill ID: ${billId} ---`);
  } catch (error) {
    console.error("Processing Error:", error);
  }
}

module.exports = { processBill };