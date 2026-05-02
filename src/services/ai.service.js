const axios = require('axios');

async function analyzeText(ocrText) {
  // Try env var first, fallback to hardcoded key
  const apiKey = process.env.GEMINI_API_KEY || "AIzaSyBHzqA8teTZ4K3EaIjyTDDiPCYbTlbzpWE";
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: "Extract vendor, amount (number), and due_date (YYYY-MM-DD) as a single JSON object. Text: " + ocrText }]
    }],
    generationConfig: {
      response_mime_type: "application/json" // This forces the AI to speak only JSON
    }
  };

  try {
    const response = await axios.post(url, payload);
    let aiText = response.data.candidates[0].content.parts[0].text;
    
    // 1. Strip out markdown if the AI ignored the MIME type
    const firstBracket = aiText.indexOf('{');
    const lastBracket = aiText.lastIndexOf('}');
    const cleanJson = aiText.substring(firstBracket, lastBracket + 1);
    
    let data = JSON.parse(cleanJson);

    // 2. THE FIX: If the AI sent [ { ... } ], grab the first item inside
    if (Array.isArray(data)) {
      data = data[0];
    }

    console.log("🚀 REAL DATA FOR DB:", data);
    return data;

  } catch (error) {
    console.error("PARSING ERROR:", error.message);
    // Fallback: try to extract basic info with regex
    return extractWithRegex(ocrText);
  }
}

// Fallback regex extractor - improved for bill parsing
function extractWithRegex(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for amount - prioritize lines with "total", "amount", "balance", "$"
  let amount = 0;
  const amountKeywords = ['total', 'amount', 'balance', 'due', 'payment', 'grand', 'sum'];
  
  for (const line of lines) {
    const lower = line.toLowerCase();
    // Check if line contains amount keywords
    const hasKeyword = amountKeywords.some(kw => lower.includes(kw));
    // Look for dollar amount pattern
    const amountMatch = line.match(/\$?([\d,]+\.\d{2})/);
    if (amountMatch) {
      const val = parseFloat(amountMatch[1].replace(/,/g, ''));
      // Prioritize lines with keywords or larger amounts
      if (hasKeyword || val > amount) {
        amount = Math.max(amount, val);
      }
    }
  }
  
  // If no keyword match, just take the largest dollar amount found
  if (amount === 0) {
    const allAmounts = text.match(/\$?([\d,]+\.\d{2})/g) || [];
    const numericAmounts = allAmounts.map(a => parseFloat(a.replace(/[$,]/g, '')));
    amount = Math.max(...numericAmounts, 0);
  }
  
  // Look for due date - prioritize "due" keyword
  let due_date = null;
  const datePatterns = [
    /(?:due|date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      due_date = match[1];
      break;
    }
  }
  
  // Find vendor - skip lines with just numbers, dates, or common non-vendor words
  const skipWords = ['invoice', 'bill', 'statement', 'page', 'date', 'amount', 'total', '$', 'tel', 'phone', 'fax'];
  let vendor = "Unknown";
  
  for (const line of lines.slice(0, 10)) { // Check first 10 lines
    const lower = line.toLowerCase();
    // Skip if line is too short, has digits only, or contains skip words
    if (line.length < 3 || /^[\d\s\W]+$/.test(line)) continue;
    if (skipWords.some(w => lower.includes(w))) continue;
    // Skip if it's mostly numbers
    if (line.replace(/[^0-9]/g, '').length > line.length * 0.5) continue;
    
    vendor = line.substring(0, 40).trim();
    break;
  }
  
  console.log("📝 FALLBACK PARSED:", { vendor, amount, due_date });
  return { vendor, amount, due_date };
}

module.exports = { analyzeText };