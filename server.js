const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test endpoint to check API key
app.get('/test', async (req, res) => {
  try {
    const fixerUrl = `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}&base=EUR&symbols=USD`;
    console.log('Testing API key with URL:', fixerUrl);
    const response = await axios.get(fixerUrl);
    console.log('Test response:', response.data);
    res.json({
      success: true,
      apiResponse: response.data,
      message: 'API key is working'
    });
  } catch (error) {
    console.error('Test error:', error.response?.data || error.message);
    res.json({
      success: false,
      error: error.response?.data || error.message,
      message: 'API key test failed'
    });
  }
});

// Currency conversion endpoint
app.get('/convert', async (req, res) => {
  const { from, to, amount } = req.query;
  if (!from || !to || !amount) {
    return res.status(400).json({ error: 'Missing required query parameters.' });
  }
  try {
    const fixerUrl = `http://data.fixer.io/api/latest?access_key=${process.env.FIXER_API_KEY}&base=EUR&symbols=${from},${to}`;
    console.log('Making request to:', fixerUrl);
    const response = await axios.get(fixerUrl);
    console.log('API Response:', response.data);
    
    if (!response.data.success) {
      return res.status(500).json({ 
        error: 'Failed to fetch rates from Fixer API.',
        details: response.data.error || 'Unknown error'
      });
    }
    const rates = response.data.rates;
    // Fixer free plan only supports EUR as base
    const amountInEUR = parseFloat(amount) / rates[from];
    const converted = amountInEUR * rates[to];
    res.json({
      from,
      to,
      amount: parseFloat(amount),
      converted,
      rate: rates[to] / rates[from],
      date: response.data.date
    });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching conversion.',
      details: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 