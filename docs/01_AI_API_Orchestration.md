# AI API Orchestration for Parallel Data Extraction

This document outlines the best practices for orchestrating parallel calls to multiple AI APIs (Claude, Gemini, GPT) for a "Discovery Agent" workflow.

## Use Case: Discovery Agent

-   **Goal:** Automatically find and extract information about Danish industrial companies.
-   **Method:** Call multiple AI APIs in parallel to process data from various sources (web pages, documents, etc.).
-   **Architecture:** A central server (e.g., running n8n or a custom application) that calls external AI APIs.

---

## 1. AI API Comparison (Claude vs. Gemini vs. GPT)

| Feature             | Anthropic Claude (Haiku/Sonnet/Opus) | Google Gemini (1.5 Pro)              | OpenAI GPT (GPT-4o)                    |
| ------------------- | ------------------------------------ | ------------------------------------ | -------------------------------------- |
| **Authentication**  | API Key                              | API Key or Google OAuth              | API Key                                |
| **Pricing (Input)** | $0.25 - $15 / 1M tokens              | ~$1.25 / 1M tokens                   | ~$1.25 / 1M tokens                     |
| **Pricing (Output)**| $1.25 - $75 / 1M tokens              | ~$5.00 / 1M tokens                   | ~$5.00 / 1M tokens                     |
| **Rate Limits**     | RPM & Tokens per Minute (per model)  | RPM & Tokens per Minute (per model)  | RPM & Tokens per Minute (per model)    |
| **JSON Mode**       | Yes (with specific prompting)        | Yes (built-in)                       | Yes (built-in)                         |
| **Best For**        | High-quality text generation, safety | Multimodality, integration with Google | General purpose, strong reasoning      |

*Note: Pricing and rate limits are subject to change. The prices listed are for representative models and can vary.*

---
## 2. Best Practices for Parallel API Calls

-   **Use Asynchronous Programming:** For I/O-bound tasks like API calls, use `async` patterns (e.g., `asyncio` in Python, `Promise.all` in JavaScript/Node.js). This allows the application to handle other tasks while waiting for the APIs to respond, significantly improving efficiency.
-   **Implement Rate Limit Handling:** All major AI APIs have rate limits. Your application must handle `429 (Too Many Requests)` errors gracefully. Implement an **exponential backoff** strategy, where the application waits for a progressively longer time before retrying the request.
-   **Add Error Handling and Fallbacks:** API calls can fail for various reasons (network issues, API downtime, etc.). Your workflow should have robust error handling. For each call, have a fallback plan. For example, if one AI provider fails, you could either retry or proceed with the results from the other providers.
-   **Use a Request Queue:** For a high volume of requests, consider using a message queue (e.g., RabbitMQ, Redis) to manage the API calls. This allows you to control the rate of requests and ensures that no requests are lost if the application crashes.

---
## 3. Prompt Engineering for Data Extraction

-   **Use JSON Mode:** For structured data extraction, always use the JSON mode offered by the APIs (e.g., `response_format={ "type": "json_object" }` in OpenAI). This forces the model to output a valid JSON object.
-   **Provide a Schema:** In your prompt, provide a clear JSON schema that defines the structure of the data you want to extract. This is the most reliable way to get consistent results.
-f-   **Few-Shot Prompting:** Include a few examples of the input text and the corresponding desired JSON output in your prompt. This helps the model understand the task better.
-   **Be Specific:** Clearly state what you want the model to do. For example: "Extract the following manufacturing capabilities from the text and return them as a JSON object with the specified schema."
-   **Choose the Right Model:** For complex data extraction from unstructured text, a more powerful model (like GPT-4 or Claude Opus) will likely perform better, even if it's more expensive. For simpler, more structured tasks, a cheaper model (like GPT-4o or Claude Haiku) may be sufficient.

---
## 4. Integration Options

-   **SDKs vs. Direct API Calls:**
    -   **SDKs (Software Development Kits):** All major AI providers offer official SDKs (e.g., `openai` for Python, `@anthropic-ai/sdk` for Node.js). **Using the SDK is highly recommended.** SDKs handle authentication, rate limit errors, and other complexities, making your code cleaner and more robust.
    -   **Direct API Calls:** Making direct HTTP requests is an option but requires you to handle authentication, error handling, and response parsing manually. This is only recommended if an SDK is not available for your programming language.
-   **n8n Nodes:**
    -   n8n has pre-built nodes for OpenAI, and community nodes are available for Anthropic and Google AI. These nodes make it very easy to integrate the APIs into a workflow without writing any code.
-   **Other Orchestration Tools:**
    -   Tools like LangChain or LlamaIndex can also be used to orchestrate AI API calls, but they are more focused on building complex AI applications rather than simple workflow automation. For this use case, n8n or a custom application is likely a better fit.

---
## 5. Code Examples

Here are basic Python examples for calling each API using their respective SDKs.

### OpenAI (GPT)

```python
import asyncio
from openai import OpenAI

# It is recommended to set the API key as an environment variable
# client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

client = OpenAI()

async def call_openai(prompt):
    try:
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content
    except Exception as e:
        return {"error": f"OpenAI API error: {e}"}
```

### Anthropic (Claude)

```python
import asyncio
from anthropic import Anthropic

# It is recommended to set the API key as an environment variable
# client = Anthropic(api_key="YOUR_ANTHROPIC_API_KEY")
client = Anthropic()

async def call_claude(prompt):
    try:
        response = await asyncio.to_thread(
            client.messages.create,
            model="claude-3-sonnet-20240229",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": f"{prompt}. Please provide the output in JSON format.",
                }
            ],
        )
        return response.content
    except Exception as e:
        return {"error": f"Anthropic API error: {e}"}
```

### Google (Gemini)

```python
import asyncio
import google.generativeai as genai

# It is recommended to set the API key as an environment variable
# genai.configure(api_key="YOUR_GEMINI_API_KEY")

async def call_gemini(prompt):
    try:
        model = genai.GenerativeModel("gemini-1.5-pro-latest")
        response = await model.generate_content_async(
            f"{prompt}. Please provide the output in JSON format."
        )
        return response.text
    except Exception as e:
        return {"error": f"Gemini API error: {e}"}
```

### Parallel Execution Example

```python
async def main():
    prompt = "Extract the company name and address from the following text: ..."
    tasks = [
        call_openai(prompt),
        call_claude(prompt),
        call_gemini(prompt),
    ]
    results = await asyncio.gather(*tasks)
    for result in results:
        print(result)

if __name__ == "__main__":
    asyncio.run(main())
```

---
## 6. Recommended Strategy

1.  **Orchestration:** Use a tool like **n8n** or a custom **Python application** with `asyncio` to manage the workflows. For a home server setup, n8n provides a great balance of power and ease of use.

2.  **API Integration:** Use the official **Python SDKs** for each AI provider. This will simplify development and provide built-in handling for authentication and errors.

3.  **Execution:** Make API calls in **parallel** using `asyncio.gather` to minimize the total response time.

4.  **Data Extraction:** Use **JSON mode** with a clearly defined schema in your prompts to ensure structured and predictable output. Start with a powerful model like **GPT-4o** or **Claude 3 Sonnet** for the best extraction results. You can experiment with cheaper models like **Claude 3 Haiku** for less critical tasks to optimize costs.

5.  **Cost Management:**
    -   Implement **caching** for API responses to avoid making the same request multiple times.
    -   Use a less expensive model for an initial "triage" step to determine if a more expensive model is needed.
    -   Set up **billing alerts** in your cloud provider dashboards to monitor costs.

6.  **Error Handling:** Implement a robust **retry mechanism with exponential backoff** for each API call. If a provider fails, your application should be able to gracefully handle the error and, if possible, proceed with the results from the other providers.
