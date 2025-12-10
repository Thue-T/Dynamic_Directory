# HTTP Request Setup: GitHub Pages to Home Server AI Workflow

Fast, minimal-resource architecture for sending JSON from a static website to a home server for AI processing.

---

## Recommended Architecture Overview

```
GitHub Pages (Static)  -->  Cloudflare Tunnel  -->  Home Server (AI Workflow)
     |                           |                        |
 fetch() POST              Zero-config proxy         Node.js/FastAPI
 + Bearer Token            + Auto HTTPS               + AI Processing
 + GZIP compression        + DDoS protection          + Cache (optional)
```

**Expected Performance:**
- Round-trip latency: 50-150ms (excluding AI processing)
- Memory usage: 50-100MB (Node.js) / 150-300MB (Python)
- Concurrent connections: 100-1000+

---

## 1. Protocol Choice: HTTP/2 POST (Not WebSockets)

**Why HTTP/2 POST is optimal for your use case:**
- Request-response pattern matches AI workflows perfectly
- Lower latency than WebSockets for single operations
- Built-in browser support with standard `fetch()` API
- Connection multiplexing (multiple requests over single TCP connection)
- Automatic header compression

**When to consider WebSockets:**
- Only if you need bidirectional streaming (e.g., real-time chat)
- WebSockets excel at 1000+ messages per connection
- Not beneficial for single request-response cycles

---

## 2. Exposing Home Server: Cloudflare Tunnel

**Why Cloudflare Tunnel (Recommended):**
- Free tier (up to 50 users)
- Zero port forwarding required
- Built-in DDoS protection
- Automatic HTTPS with valid certificates
- Hides your home IP address
- Adds only 10-30ms latency

### Setup Steps

```bash
# 1. Install cloudflared
# macOS
brew install cloudflare/cloudflare/cloudflared

# Linux
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# 2. Authenticate
cloudflared tunnel login

# 3. Create tunnel
cloudflared tunnel create my-ai-api

# 4. Create config file (~/.cloudflared/config.yml)
tunnel: <YOUR-TUNNEL-ID>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404

# 5. Create DNS record
cloudflared tunnel route dns my-ai-api api.yourdomain.com

# 6. Run tunnel
cloudflared tunnel run my-ai-api
```

### Alternative: Tailscale Funnel (Simpler Setup)

```bash
# 1. Install and authenticate
brew install tailscale
sudo tailscale up

# 2. Expose service
tailscale funnel 3000
# URL: https://<machine-name>.<tailnet-name>.ts.net
```

---

## 3. Server Implementation

### Option A: Node.js/Express (Fastest Setup)

```bash
mkdir my-ai-api && cd my-ai-api
npm init -y
npm install express cors compression express-rate-limit dotenv
```

**server.js:**
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Enable GZIP/Brotli compression
app.use(compression());

// CORS - Allow GitHub Pages origin
app.use(cors({
  origin: [
    'https://yourusername.github.io',
    'http://localhost:5000'  // Local testing
  ],
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting (100 requests per 15 minutes per IP)
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
}));

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== process.env.API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Health check (no auth)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Main API endpoint
app.post('/api/process', authenticate, async (req, res) => {
  try {
    const startTime = Date.now();
    const data = req.body;

    // YOUR AI WORKFLOW HERE
    const result = await processAIWorkflow(data);

    res.json({
      success: true,
      result,
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Placeholder for AI workflow
async function processAIWorkflow(data) {
  // Replace with your actual AI processing
  return { processed: true, output: 'AI result' };
}

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connection keep-alive optimization
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
```

**.env file:**
```
API_SECRET=your-random-secret-here-use-strong-random-string
PORT=3000
```

### Option B: Python/FastAPI (Best for Python AI)

```bash
pip install fastapi uvicorn python-dotenv
```

**main.py:**
```python
import os
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Enable GZIP compression
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourusername.github.io",
        "http://localhost:5000"
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

API_SECRET = os.getenv("API_SECRET")

# Authentication
async def verify_token(request: Request):
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "")
    if token != API_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

class ProcessRequest(BaseModel):
    data: dict

class ProcessResponse(BaseModel):
    success: bool
    result: dict
    processingTime: int = None

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/process", response_model=ProcessResponse)
async def process(
    request: ProcessRequest,
    authenticated: bool = Depends(verify_token)
):
    import time
    start = time.time()

    # YOUR AI WORKFLOW HERE
    result = await process_ai_workflow(request.data)

    processing_time = int((time.time() - start) * 1000)
    return ProcessResponse(
        success=True,
        result=result,
        processingTime=processing_time
    )

async def process_ai_workflow(data: dict) -> dict:
    # Replace with your actual AI processing
    return {"processed": True, "output": "AI result"}
```

**Run:**
```bash
uvicorn main:app --host 0.0.0.0 --port 3000 --timeout-keep-alive 65
```

---

## 4. Client-Side Code (GitHub Pages)

**api-client.js:**
```javascript
const API_URL = 'https://api.yourdomain.com/api/process';
const API_TOKEN = 'your-api-secret-here';

async function sendToAI(data) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Usage
document.getElementById('submitBtn').addEventListener('click', async () => {
  const inputData = {
    text: document.getElementById('input').value
  };

  try {
    const result = await sendToAI(inputData);
    document.getElementById('output').textContent =
      JSON.stringify(result, null, 2);
  } catch (error) {
    document.getElementById('output').textContent =
      `Error: ${error.message}`;
  }
});
```

---

## 5. JSON Optimization

### Built-in (Always Use)
- **GZIP/Brotli compression**: Reduces JSON by 60-90%
- Enabled automatically with `compression` middleware
- No client-side changes needed

### For Large Payloads (>500KB): MessagePack

```bash
npm install @msgpack/msgpack
```

**Client:**
```javascript
import { encode, decode } from '@msgpack/msgpack';

const encoded = encode(data);
const response = await fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-msgpack' },
  body: encoded
});
const result = decode(new Uint8Array(await response.arrayBuffer()));
```

---

## 6. Optional: Caching (For Repeated Queries)

```bash
npm install node-cache
```

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 min TTL

app.post('/api/process', authenticate, async (req, res) => {
  const cacheKey = JSON.stringify(req.body);

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  // Process and cache
  const result = await processAIWorkflow(req.body);
  cache.set(cacheKey, result);

  res.json(result);
});
```

---

## 7. Security Checklist

- [ ] HTTPS only (automatic with Cloudflare Tunnel)
- [ ] API authentication (Bearer token)
- [ ] Rate limiting enabled
- [ ] CORS restricted to your domain
- [ ] Secrets in environment variables
- [ ] Input validation on server
- [ ] Keep dependencies updated

---

## 8. Quick Start Commands

```bash
# Terminal 1: Start server
node server.js

# Terminal 2: Start tunnel
cloudflared tunnel run my-ai-api

# Test endpoint
curl -X POST https://api.yourdomain.com/api/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-secret" \
  -d '{"data": {"test": "hello"}}'
```

---

## Performance Summary

| Component | Latency Added | Resource Usage |
|-----------|---------------|----------------|
| Client fetch() | ~5ms | Minimal |
| Cloudflare Tunnel | 10-30ms | None (external) |
| Server processing | 10-20ms | 50-100MB RAM |
| **Total overhead** | **25-55ms** | **Minimal** |

*AI workflow processing time is additional and depends on your model/task.*

---

## Comparison: Why This Approach?

| Alternative | Issue |
|-------------|-------|
| WebSockets | Overkill for request-response; adds complexity |
| ngrok | Costs $8/month for production features |
| Port forwarding | Exposes home IP; requires router config |
| Serverless (Lambda) | Cold starts add 100-500ms latency |
| Long polling | Wastes resources; higher latency |

**This setup provides the fastest possible path with minimal resources while remaining simple to implement and maintain.**
