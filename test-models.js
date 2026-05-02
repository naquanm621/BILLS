const axios = require('axios');

const apiKey = "AIzaSyBHzqA8teTZ4K3EaIjyTDDiPCYbTlbzpWE"; 
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  try {
    console.log("--- Requesting Model List from Google... ---");
    const response = await axios.get(url);
    
    console.log("FOUND MODELS:");
    response.data.models.forEach(m => {
      console.log(`-> Name: ${m.name} | Methods: ${m.supportedGenerationMethods}`);
    });
  } catch (error) {
    console.error("Discovery Failed:", error.response?.data || error.message);
  }
}

listModels();