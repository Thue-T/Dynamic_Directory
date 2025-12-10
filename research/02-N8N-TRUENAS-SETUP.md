# Research: n8n on TrueNAS Setup and Capabilities

Research conducted: 2025-12-09

## Summary

n8n is available directly in the TrueNAS Apps Catalog, making installation straightforward. It's well-suited for orchestrating AI API calls and handling webhooks from a GitHub Pages frontend.

---

## Installation Options

### Option 1: TrueNAS Apps Catalog (Recommended)

**Current Version:** 1.123.0 (app version 1.6.83)
**Minimum TrueNAS SCALE:** 24.10.2.2
**Last Updated:** 2025-12-02

**Steps:**
1. Open TrueNAS SCALE web interface
2. Navigate to Apps → Discover Apps
3. Search for "n8n"
4. Click Install
5. Configure storage paths and network settings
6. Deploy

**Configuration:**
- Runs as non-root user (UID: 568, GID: 568)
- Includes PostgreSQL database (UID: 999, GID: 999)
- Persistent storage for workflows

---

### Option 2: Docker Compose (Alternative)

For more control, use Docker Compose directly:

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
      - WEBHOOK_URL=https://your-tunnel-url.com/
    volumes:
      - /mnt/app-pool/n8n/data:/home/node/.n8n
      - /mnt/app-pool/n8n/files:/files
```

**Setup commands:**
```bash
mkdir -p /mnt/app-pool/n8n/data /mnt/app-pool/n8n/files
chown -R 1000:1000 /mnt/app-pool/n8n
```

---

## n8n Capabilities for This Project

### Webhook Endpoints
- Create webhook URLs to receive HTTP requests from GitHub Pages
- Support for GET, POST, PUT, DELETE methods
- JSON payload parsing built-in
- Authentication options (Basic Auth, Header Auth)

### AI API Integration
n8n has native nodes for:
- **OpenAI** - GPT models, chat completions, embeddings
- **Anthropic Claude** - Direct API integration
- **Google AI** - Gemini models

### Parallel Execution
- Use "Split In Batches" node for parallel processing
- "Execute Workflow" node can run sub-workflows in parallel
- Rate limiting controls to respect API limits

### Web Scraping
- HTTP Request node for fetching web pages
- HTML Extract node for parsing
- Can integrate with external scraping services

### Error Handling
- Built-in retry logic
- Error workflows for handling failures
- Logging and monitoring

---

## Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 512MB | 2GB |
| CPU | 1 core | 2 cores |
| Storage | 1GB | 10GB |

---

## HTTPS/SSL Setup

For external access (from GitHub Pages), you need HTTPS:

1. **Cloudflare Tunnel (Recommended)** - See HTTP-request-setup.md
2. **Reverse Proxy** - Nginx/Caddy with Let's Encrypt
3. **TrueNAS built-in** - Configure SSL certificate in TrueNAS

---

## Known Issues

- Community node installation may fail on TrueNAS Scale 24.10.2 (check n8n community forums for workarounds)
- Ensure volumes are properly mounted to avoid data loss on updates

---

## Assessment for This Project

**Verdict: n8n is suitable for the Discovery Agent orchestration layer**

**Strengths:**
- Easy installation via TrueNAS Apps
- Native AI API nodes
- Visual workflow builder
- Webhook support for GitHub Pages integration
- Parallel execution capabilities

**Limitations:**
- May require Cloudflare Tunnel for HTTPS exposure
- Community nodes can be tricky on TrueNAS
- Learning curve for complex workflows

---

## Sources

- [TrueNAS n8n Documentation](https://www.truenas.com/docs/truenasapps/communityapps/n8n/)
- [TrueNAS Apps Market - n8n](https://apps.truenas.com/catalog/n8n/)
- [Official n8n Docker Documentation](https://docs.n8n.io/hosting/installation/docker/)
- [Techno Tim's n8n Self-Hosting Guide](https://technotim.live/posts/n8n-self-hosted/)
- [n8n Docker Compose Setup](https://docs.n8n.io/hosting/installation/server-setups/docker-compose/)
- [Latenode - n8n Docker Installation Guide 2025](https://latenode.com/blog/low-code-no-code-platforms/self-hosted-automation-platforms/n8n-docker-installation-complete-setup-guide-production-configuration-examples-2025)
