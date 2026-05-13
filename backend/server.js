require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GAPI_KEY;

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are an expert Ayurveda assistant. Answer questions about 
  Ayurvedic herbs, remedies, treatments, diet, and lifestyle clearly 
  and helpfully. Keep responses concise and friendly.`
};

app.post('/chat', async (req, res) => {
  try {
    const messages = req.body.messages;

    // ✅ Log what we're receiving to debug
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [SYSTEM_PROMPT, ...messages], // ✅ system prompt only once, at the start
        stream: false
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    // ✅ Log what we're sending back
    console.log('Reply:', reply);

    res.json({ content: [{ text: reply }] });

  } catch (err) {
    console.error('Groq error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || 'Something went wrong' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));