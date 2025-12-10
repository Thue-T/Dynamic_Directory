# Project Context: Dynamic Danish Producer Directory

This file provides guidance to AI assistants (Claude Code, Gemini) when working with code in this repository.

## Project Overview

A web platform for intelligently searching and connecting with Danish industrial production companies, initially focused on steel and pipe fabrication. The key feature is a **self-evolving filter system** that learns from user interactions and discovered company data.

## Current Status: v1.0 MVP

The frontend is built and functional with:
- Static HTML + Pico CSS (deployed to GitHub Pages)
- 12 real Danish steel companies in the database
- Self-evolving filter system based on discovered parameters
- Analytics tracking for search optimization

## Project Structure

```
/
├── packages/
│   └── frontend/           # Static site for GitHub Pages
│       ├── index.html      # Main search interface
│       ├── css/custom.css  # Custom styles
│       └── js/
│           ├── config.js   # Configuration settings
│           ├── storage.js  # LocalStorage management
│           ├── data-loader.js  # Loads company data
│           ├── filters.js  # Self-evolving filter system
│           ├── search.js   # Search logic and rendering
│           └── app.js      # Main application entry
├── data/
│   ├── companies/
│   │   └── companies.json  # Danish steel companies (12 entries)
│   ├── schemas/
│   │   ├── company-schema.json    # Company data structure
│   │   ├── filter-schema.json     # Dynamic filter structure
│   │   ├── analytics-schema.json  # Usage tracking
│   │   └── initial-filters.json   # Discovered filters
│   └── analytics/          # Usage data (future)
├── research/               # AI-readable research documents
│   ├── 00-ARCHITECTURE-SUMMARY.md
│   ├── 01-HTML-TEMPLATES.md
│   ├── 02-N8N-TRUENAS-SETUP.md
│   ├── 03-AI-API-ORCHESTRATION.md
│   ├── 04-N8N-ALTERNATIVES.md
│   └── 05-DANISH-COMPANY-DATA.md
└── HTTP-request-setup.md   # Cloudflare Tunnel setup guide
```

## Technology Stack (v1.0)

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Pico CSS + Vanilla JS | ~10KB CSS, no build step |
| Hosting | GitHub Pages | Free, HTTPS included |
| Data Storage | JSON files + localStorage | Will migrate to PostgreSQL |
| Backend (planned) | n8n on TrueNAS | Workflow orchestration |
| AI APIs | Claude, Gemini, GPT | For data extraction |

## Key Concepts

### Self-Evolving Filters

Filters are NOT hardcoded. They are discovered from company data and prioritized by:
1. **Occurrence count** - How many companies have this parameter
2. **Success score** - How often this filter leads to contacts
3. **Usage count** - How often users apply this filter

See `packages/frontend/js/filters.js` for implementation.

### Analytics Tracking

The system tracks:
- **Searches** - Query text, filters used, result count
- **Clicks** - Which companies users click on
- **Contacts** - Highest value event (email/website visits)

This data feeds back into filter prioritization.

### Company Data Schema

Companies have flexible `capabilities` objects that can contain any discovered parameters:
```json
{
  "capabilities": {
    "processes": ["Laser Cutting", "Welding"],
    "materials": ["Steel", "Stainless Steel"],
    "cutting": {
      "types": ["Fiber Laser"],
      "maxThickness": { "steel": 25, "unit": "mm" }
    }
  }
}
```

## Running the Frontend

For local development:
```bash
cd packages/frontend
python -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000

## Data Sources

Company data is extracted from:
- **Danish CVR API** - Official business registry (free)
- **Company websites** - Capabilities extracted via AI
- **Industry directories** - EN 1090 certified fabricators

See `research/05-DANISH-COMPANY-DATA.md` for details.

## Planned Backend (n8n)

When ready to add dynamic discovery:
1. Install n8n on TrueNAS (see `research/02-N8N-TRUENAS-SETUP.md`)
2. Set up Cloudflare Tunnel (see `HTTP-request-setup.md`)
3. Create webhook workflow for searches
4. Add AI extraction nodes (Claude for best accuracy)

## Custom Agents

- `research-expert` - Uses Gemini CLI for web research: `geminij -p "prompt"`

## Important Files to Read

When working on this project:
1. `research/00-ARCHITECTURE-SUMMARY.md` - Full system design
2. `data/schemas/company-schema.json` - Company data structure
3. `packages/frontend/js/filters.js` - Self-evolving filter logic
4. `packages/frontend/js/search.js` - Search and rendering
