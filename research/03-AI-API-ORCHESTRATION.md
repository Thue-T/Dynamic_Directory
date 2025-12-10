# Research: AI API Orchestration (Claude, Gemini, GPT)

Research conducted: 2025-12-09

## Summary

For the Discovery Agent, use a multi-model approach: **Claude for coding/extraction tasks**, **Gemini for large context analysis**, and **GPT for general orchestration**. All three support parallel execution and structured JSON output.

---

## API Comparison

| Feature | Claude (Anthropic) | Gemini (Google) | GPT (OpenAI) |
|---------|-------------------|-----------------|--------------|
| **Best Model** | Claude 4 / Sonnet 4.5 | Gemini 2.5 Pro | GPT-4.1 |
| **Context Window** | 200K tokens | 2M tokens | 1M tokens |
| **Coding Benchmark** | 72.7% (best) | 63.8% | 54.6% |
| **Tool Calling** | Excellent | Good | Excellent |
| **Parallel Calls** | Yes | Yes | Yes |
| **JSON Mode** | Yes | Yes | Yes |

---

## Pricing (per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| **Claude Sonnet** | $3 | $15 |
| **Claude Opus** | $15 | $75 |
| **GPT-4.1** | $2 | $8 |
| **Gemini 2.5 Pro** | $1.25-2.50 | $5-10 |

**Gemini is cheapest**, Claude is most expensive but best for coding/extraction.

---

## Recommended Task Assignment

### For This Project's Discovery Agent:

| Task | Recommended AI | Reason |
|------|---------------|--------|
| **Web page parsing** | Gemini | Large context, cheap |
| **Data extraction to JSON** | Claude Sonnet | Best structured output |
| **Company capability analysis** | Claude Sonnet | Best reasoning |
| **Initial search/discovery** | GPT-4o-mini | Fast, cheap |
| **Fallback/retry** | Gemini Flash | Fast, cheap |

---

## Parallel Execution Strategy

### n8n Workflow Pattern:

```
Webhook (receive search query)
    │
    ├─→ [Parallel Branch 1] Google Search → Scrape URLs
    ├─→ [Parallel Branch 2] CVR API Lookup
    └─→ [Parallel Branch 3] Industry Database Search
    │
    ▼
Merge Results
    │
    ▼
[Parallel AI Processing]
    ├─→ Claude: Extract capabilities from website text
    ├─→ Gemini: Analyze large documents
    └─→ GPT: Summarize and structure
    │
    ▼
Merge & Deduplicate
    │
    ▼
Return JSON Response
```

### Rate Limit Handling:

```javascript
// Retry with exponential backoff
const callWithRetry = async (apiCall, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.status === 429) {
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      throw error;
    }
  }
};
```

---

## API Code Examples

### Claude API (Anthropic)

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 4096,
  messages: [{
    role: 'user',
    content: `Extract manufacturing capabilities from this text as JSON:

    ${websiteText}

    Return: { welding: {...}, cutting: {...}, certifications: [...] }`
  }]
});
```

### Gemini API (Google)

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: 'application/json'
  }
});
```

### OpenAI API (GPT)

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  response_format: { type: 'json_object' }
});
```

---

## n8n Integration

n8n has native nodes for all three:

1. **OpenAI Node** - Chat, completions, embeddings
2. **Anthropic Node** - Claude messages API
3. **Google AI Node** - Gemini models

Configure each with API keys in n8n credentials.

---

## Cost Optimization Strategy

1. **Use Gemini Flash for initial screening** (cheapest)
2. **Use Claude only for complex extraction** (best quality)
3. **Cache results** to avoid duplicate API calls
4. **Batch similar requests** where possible
5. **Use smaller context** when full page not needed

**Estimated cost per company discovery:** $0.02-0.10 (depending on complexity)

---

## Sources

- [DJamware - Comparing OpenAI vs Claude vs Gemini APIs](https://www.djamware.com/post/689e8836a378ff6175921d4a/comparing-openai-vs-claude-vs-gemini-which-ai-api-is-best-for-developers)
- [Creator Economy - ChatGPT vs Claude vs Gemini 2025](https://creatoreconomy.so/p/chatgpt-vs-claude-vs-gemini-the-best-ai-model-for-each-use-case-2025)
- [IntuitionLabs - AI API Pricing Comparison 2025](https://intuitionlabs.ai/articles/ai-api-pricing-comparison-grok-gemini-openai-claude)
- [ITECS - Claude 4 vs GPT-4.1 vs Gemini 2.5 Pricing & Performance](https://itecsonline.com/post/claude-4-vs-gpt-4-vs-gemini-pricing-features-performance)
- [Klavis - Claude Opus 4.5 vs Gemini 3 Pro vs GPT-5 for Developers](https://www.klavis.ai/blog/claude-opus-4-5-vs-gemini-3-pro-vs-gpt-5-the-ultimate-agentic-ai-showdown-for-developers)
