# VektorFlow Backend Router

OAuth callback handler for VektorFlow Dashboard v4.

### **Endpoints**
- `GET /health` - Health check
- `GET /callback/meta` - Meta OAuth redirect
- `GET /callback/tiktok` - TikTok OAuth redirect  
- `GET /callback/x` - X OAuth redirect
- `POST /api/post` - Cross-post to connected platforms

### **Deploy**
1. Connect this repo to Render as a Blueprint
2. Add environment variables from `.env.example`
3. Set `FRONTEND_URL` to your Lovable dashboard URL
4. Update OAuth apps with `https://your-render-url.com/callback/{platform}`

### **Required API Keys**
Meta, TikTok, X, Plaid, DeepSeek, OpenAI, Gemini
