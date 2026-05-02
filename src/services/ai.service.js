const axios = require('axios');

async function analyzeText(ocrText) {
  const apiKey = "AIzaSyBHzqA8teTZ4K3EaIjyTDDiPCYbTlbzpWE"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

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
    return { vendor: "Check Invoice", amount: 0, due_date: null };
  }
}

module.exports = { analyzeText };