# Research: Danish Company Data Sources

Research conducted: 2025-12-09

## Summary

The **CVR (Central Business Register)** is the primary official source for Danish company data, with free API access. Combine with industry directories and company website scraping for manufacturing capabilities.

---

## Primary Data Sources

### 1. CVR - Det Centrale Virksomhedsregister (Official Registry)

**The authoritative source for Danish business data**

- **Website:** https://datacvr.virk.dk/data/
- **English Version:** https://datacvr.virk.dk/data/?language=en-gb
- **API Type:** Elasticsearch-based REST API + SOAP
- **Cost:** FREE for data that doesn't require manual processing

**Available Data:**
- 2.2M+ Companies with full business data
- 1.7M+ Participants (owners, directors, board members)
- 2.8M+ Production Units (branch offices, facilities)

**Data Fields:**
- Company name and CVR number
- Registration date and legal status
- Industry classification (NACE codes)
- Address and contact information
- Organization type
- Beneficial owners (UBOs)
- Board members and managers
- Audit firms
- Authorization and signatory rights

**API Access Options:**
1. **Web Search** - Free public portal
2. **REST API** - Elasticsearch queries
3. **SOAP Webservices** - For bulk data
4. **System-to-system** - For large quantities

---

### 2. Third-Party CVR API Providers

#### Signicat Data Verification API
- Commercial API with cleaned CVR data
- Good for identity verification use cases
- [Documentation](https://developer.signicat.com/docs/data-verification/data-sources/organisations/cvr-det-centrale-virksomhedsregister/)

#### Lasso CVR API
- Provides CVR data plus calculated data
- Personal networks, ownership hierarchies
- [Documentation](https://docs.lassox.com/data-apis/cvr/)

---

### 3. Industry-Specific Sources

| Source | Data Type | Access |
|--------|-----------|--------|
| **Dansk Industri (DI)** | Member directory | Website scraping |
| **Dansk Metal** | Metal industry companies | Website scraping |
| **EN 1090 Certification DB** | Steel fabricators | Public records |
| **ISO Certificate Databases** | Certified companies | Various |

---

## Data Extraction Strategy

### Step 1: CVR Lookup
```
User searches: "steel fabrication Copenhagen"
    │
    ▼
Query CVR API for:
- Industry code: 25 (Manufacture of fabricated metal products)
- Location: Copenhagen region
    │
    ▼
Returns: List of CVR numbers + basic company info
```

### Step 2: Website Discovery
```
For each company:
    │
    ├─→ Check if website in CVR data
    ├─→ Google search: "{company name} website"
    └─→ LinkedIn company page lookup
    │
    ▼
Collect: Website URLs
```

### Step 3: Capability Extraction
```
For each website:
    │
    ├─→ Scrape main pages (/about, /services, /capabilities)
    └─→ Send to AI for extraction
    │
    ▼
AI extracts:
{
  "welding": { "maxThickness": "20mm", "materials": ["S355", "316L"] },
  "cutting": { "type": "laser", "maxThickness": "25mm" },
  "certifications": ["EN 1090-2", "ISO 9001"]
}
```

---

## Relevant Industry Codes (NACE)

For steel and pipe fabrication, filter by these codes:

| Code | Description |
|------|-------------|
| 25.11 | Manufacture of metal structures and parts |
| 25.12 | Manufacture of doors and windows of metal |
| 25.21 | Manufacture of central heating radiators and boilers |
| 25.29 | Manufacture of other tanks, reservoirs, containers |
| 25.30 | Manufacture of steam generators |
| 25.61 | Treatment and coating of metals |
| 25.62 | Machining |

---

## Legal Considerations (GDPR)

### What You CAN Collect:
- Public company information from CVR
- Information published on company websites
- Business contact information (work emails, phone)
- Published certifications and capabilities

### What Requires Caution:
- Personal data of employees (names, personal emails)
- Scraping at high frequency (respect robots.txt)
- Storing data indefinitely (have retention policy)

### Best Practices:
1. Use official CVR API when possible
2. Respect robots.txt on websites
3. Include opt-out mechanism for companies
4. Store only business-relevant data
5. Document your legal basis (legitimate interest for B2B)

---

## Example Discovery Workflow

```
1. INPUT: User searches "bending steel plates 15mm Denmark"

2. CVR QUERY:
   - Filter: Industry codes 25.11, 25.29
   - Return: Companies with relevant capabilities

3. FOR EACH COMPANY:
   a. Get CVR data (name, address, website)
   b. Scrape company website
   c. Extract capabilities with AI:
      - "Can bend 15mm? Yes/No"
      - "Max thickness?"
      - "Materials?"

4. RANK & RETURN:
   - Sort by capability match
   - Return top 10 results with confidence scores
```

---

## API Code Example (CVR)

```javascript
// CVR Elasticsearch API query
const searchCVR = async (industryCode, location) => {
  const response = await fetch('https://cvrapi.dk/api', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  // Note: Actual CVR API may require authentication
  // Check https://datacvr.virk.dk for current access methods
  return response.json();
};
```

---

## Sources

- [Signicat - CVR Documentation](https://developer.signicat.com/docs/data-verification/data-sources/organisations/cvr-det-centrale-virksomhedsregister/)
- [OpenSanctions - Denmark Central Business Register](https://www.opensanctions.org/datasets/dk_cvr/)
- [European e-Justice Portal - Business Registers Denmark](https://e-justice.europa.eu/topics/registers-business-insolvency-land/business-registers-eu-countries/dk_en)
- [Lasso CVR Data Documentation](https://docs.lassox.com/data-apis/cvr/)
- [Open Ownership - Denmark CVR Register](https://register.openownership.org/data_sources/dk-cvr-register)
- [CVR Documentation (GitHub)](https://brokk-sindre.github.io/cvr-documentation/)
