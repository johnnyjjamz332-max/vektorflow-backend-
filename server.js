server.jsconst express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const tokens = {};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/callback/meta', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: process.env.META_REDIRECT_URI,
        code
      }
    });
    tokens.meta = response.data.access_token;
    res.redirect(`${process.env.FRONTEND_URL}?connected=meta`);
  } catch (err) {
    res.status(500).json({ error: 'Meta auth failed' });
  }
});

app.get('/callback/tiktok', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TIKTOK_REDIRECT_URI
    });
    tokens.tiktok = response.data.access_token;
    res.redirect(`${process.env.FRONTEND_URL}?connected=tiktok`);
  } catch (err) {
    res.status(500).json({ error: 'TikTok auth failed' });
  }
});

app.get('/callback/x', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: process.env.X_CLIENT_ID,
      redirect_uri: process.env.X_REDIRECT_URI,
      code_verifier: 'challenge'
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`).toString('base64')}`
      }
    });
    tokens.x = response.data.access_token;
    res.redirect(`${process.env.FRONTEND_URL}?connected=x`);
  } catch (err) {
    res.status(500).json({ error: 'X auth failed' });
  }
});

app.post('/api/post', async (req, res) => {
  const { platforms, content } = req.body;
  const results = {};
  
  if (platforms.includes('meta') && tokens.meta) {
    try {
      await axios.post(`https://graph.facebook.com/me/feed`, {
        message: content,
        access_token: tokens.meta
      });
      results.meta = 'success';
    } catch (err) { results.meta = 'failed'; }
  }
  
  if (platforms.includes('x') && tokens.x) {
    try {
      await axios.post('https://api.twitter.com/2/tweets', {
        text: content
      }, { headers: { Authorization: `Bearer ${tokens.x}` }});
      results.x = 'success';
    } catch (err) { results.x = 'failed'; }
  }
  
  res.json({ results });
});

app.listen(PORT, () => {
  console.log(`VektorFlow backend running on port ${PORT}`);
});
