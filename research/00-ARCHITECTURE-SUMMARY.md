# v1.0 Architecture Summary: Danish Producer Directory

Research compiled: 2025-12-09

## Recommended Stack for MVP

```
┌─────────────────────────────────────────────────────────────────┐
│                     GITHUB PAGES (Frontend)                      │
│                                                                  │
│  • Static HTML + Pico CSS (~10KB)                               │
│  • Search interface                                              │
│  • JavaScript fetch() to backend                                 │
│  • Zero hosting cost                                             │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS POST (via Cloudflare Tunnel)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TRUENAS SERVER (Backend)                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    n8n Workflows                         │   │
│  │                                                          │   │
│  │  Webhook ──→ Orchestrator ──→ AI Nodes ──→ Response     │   │
│  │                   │                                      │   │
│  │         ┌─────────┼─────────┐                           │   │
│  │         ▼         ▼         ▼                           │   │
│  │      CVR API   Scraper   AI APIs                        │   │
│  │     (Danish)  (Websites) (Claude/Gemini/GPT)            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  • Installed via TrueNAS Apps Catalog                           │
│  • Exposed via Cloudflare Tunnel (HTTPS)                        │
│  • PostgreSQL for workflow data                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Decisions

| Component | Choice | Reason |
|-----------|--------|--------|
| **Frontend CSS** | Pico CSS | Lightweight (10KB), semantic, dark mode |
| **Frontend Hosting** | GitHub Pages | Free, reliable, HTTPS included |
| **Backend Orchestration** | n8n | Native AI nodes, TrueNAS app available |
| **Tunnel/Proxy** | Cloudflare Tunnel | Free, secure, no port forwarding |
| **Primary AI** | Claude Sonnet | Best for data extraction (72.7% coding benchmark) |
| **Cheap AI (screening)** | Gemini Flash | Lowest cost, 2M context |
| **Company Data** | Danish CVR API | Official registry, free access |

---

## Implementation Steps (v1.0)

### Phase 1: Infrastructure (Day 1)

1. **Install n8n on TrueNAS**
   - TrueNAS Apps → Search "n8n" → Install
   - Configure persistent storage
   - Note the local URL (e.g., http://truenas:5678)

2. **Set up Cloudflare Tunnel**
   ```bash
   # On TrueNAS or a container
   cloudflared tunnel create producer-api
   cloudflared tunnel route dns producer-api api.yourdomain.com
   cloudflared tunnel run producer-api
   ```

3. **Configure n8n credentials**
   - Add Anthropic API key (Claude)
   - Add Google AI API key (Gemini)
   - Add OpenAI API key (GPT) - optional

### Phase 2: Frontend (Day 1-2)

1. **Create GitHub repository**
   - Enable GitHub Pages
   - Use Pico CSS from CDN

2. **Build search page**
   ```html
   <!DOCTYPE html>
   <html data-theme="light">
   <head>
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
   </head>
   <body>
     <main class="container">
       <h1>Danish Producer Directory</h1>
       <form id="search-form">
         <input type="search" id="query" placeholder="e.g., steel bending 15mm Copenhagen">
         <button type="submit">Search</button>
       </form>
       <div id="results"></div>
     </main>
     <script src="app.js"></script>
   </body>
   </html>
   ```

### Phase 3: n8n Workflow (Day 2-3)

1. **Create webhook trigger**
   - POST /webhook/search
   - Accept JSON: `{ "query": "..." }`

2. **Build discovery workflow**
   ```
   Webhook
     │
     ├─→ [CVR Search] Query Danish business registry
     │
     ├─→ [Web Search] Find company websites
     │
     └─→ [Parallel AI Processing]
           ├─→ Gemini: Parse large website content
           └─→ Claude: Extract structured capabilities
     │
     ▼
   Merge Results → Format JSON → Respond to Webhook
   ```

3. **Set up error handling**
   - Retry failed API calls
   - Fallback to alternative AI if one fails

### Phase 4: Testing (Day 3)

1. Test end-to-end flow
2. Verify CORS headers
3. Check response times
4. Test error scenarios

---

## Cost Estimates (Monthly)

| Service | Cost |
|---------|------|
| GitHub Pages | Free |
| Cloudflare Tunnel | Free |
| n8n (self-hosted) | Free |
| TrueNAS (already owned) | $0 |
| Claude API (~100 queries) | ~$5 |
| Gemini API (~100 queries) | ~$2 |
| **Total** | **~$7/month** |

---

## Files Created

| File | Purpose |
|------|---------|
| `research/01-HTML-TEMPLATES.md` | CSS framework comparison |
| `research/02-N8N-TRUENAS-SETUP.md` | n8n installation guide |
| `research/03-AI-API-ORCHESTRATION.md` | AI API comparison & code examples |
| `research/04-N8N-ALTERNATIVES.md` | Alternative tools assessment |
| `research/05-DANISH-COMPANY-DATA.md` | CVR API & data sources |
| `HTTP-request-setup.md` | Cloudflare Tunnel setup |

---

## Next Steps

1. [ ] Install n8n on TrueNAS
2. [ ] Set up Cloudflare Tunnel
3. [ ] Create GitHub Pages repository
4. [ ] Build basic search HTML with Pico CSS
5. [ ] Create n8n webhook workflow
6. [ ] Add CVR API integration
7. [ ] Add AI extraction nodes
8. [ ] Test full flow
9. [ ] Iterate on prompts for better extraction

---

## Key Decisions Explained

### Why n8n over alternatives?
- Already available in TrueNAS Apps (zero setup friction)
- Native Claude, Gemini, GPT nodes
- Visual debugging for workflows
- Active community support

### Why Pico CSS over Tailwind/Bootstrap?
- 10KB vs 300KB+ = faster load times
- No build step required
- Semantic HTML = cleaner code
- Dark mode built-in

### Why Cloudflare Tunnel?
- Free tier sufficient
- No port forwarding = more secure
- Automatic HTTPS
- Works with dynamic IP

### Why Claude for extraction?
- 72.7% on software engineering benchmarks
- Best structured output quality
- Worth the slightly higher cost for accuracy
