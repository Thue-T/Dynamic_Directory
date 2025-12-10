# Simpler Alternatives to n8n for Self-Hosted Workflow Automation

This document researches simpler alternatives to n8n for workflow automation on a TrueNAS home server, focusing on ease of setup, resource usage, and suitability for AI API orchestration.

## Requirements

-   Self-hosted (runs on TrueNAS or in Docker)
-   Can receive webhooks/HTTP requests
-   Can make API calls to external services
-   Can orchestrate parallel tasks
-   Simple to set up and maintain
-   Low resource usage

---

## 1. Comparison of n8n Alternatives

| Tool             | Installation Complexity | Resource Usage | Learning Curve | AI Orchestration Capability | Community & Docs |
| ---------------- | ----------------------- | -------------- | -------------- | --------------------------- | ---------------- |
| **n8n**          | Medium                  | Medium-High    | Medium         | Excellent (built-in nodes)  | Excellent        |
| **Node-RED**     | Low                     | Very Low       | Low-Medium     | Good (requires `http-request` node) | Excellent        |
| **Huginn**       | Medium                  | Low-Medium     | Medium-High    | Good (agent-based)          | Good             |
| **Activepieces** | Low                     | Low            | Low            | Good (growing library)      | Good             |
| **Windmill**     | Medium-High             | Medium-High    | High           | Excellent (code-focused)    | Good             |
| **Express/FastAPI** | Low (for devs)         | Very Low       | Low (for devs) | Excellent (custom code)     | N/A              |
| **OpenFaaS**     | High                    | Medium         | High           | Good (function-based)       | Good             |

---

## 2. Top 3 Recommendations (Ranked by Simplicity)

1.  **Node-RED:**
    -   **Why it's #1:** Node-RED is extremely lightweight, has a very simple and intuitive visual editor, and a massive community with a huge library of pre-built nodes. It's perfect for simple API orchestration and can be set up in minutes.
    -   **Simplicity:** Very low. The visual, flow-based programming model is easy to grasp.
    -   **Resource Usage:** Very low. It can run on a Raspberry Pi.

2.  **Activepieces:**
    -   **Why it's #2:** Activepieces is a modern, open-source alternative to Zapier and n8n. It's designed to be very easy to use, with a clean and simple UI.
    -   **Simplicity:** Low. It's very similar to n8n but with a focus on simplicity.
    -   **Resource Usage:** Low.

3.  **Custom Express.js/FastAPI Server:**
    -   **Why it's #3:** For a developer, writing a simple server in Express.js (Node.js) or FastAPI (Python) can be the quickest and most flexible solution. It offers complete control and has minimal resource usage.
    -   **Simplicity:** Low (for a developer). High (for a non-developer).
    -   **Resource Usage:** Very low.

---

## 3. Is n8n Actually the Best Choice?

-   **For complex workflows:** Yes, n8n is likely the best choice. It has a more powerful feature set than most simpler alternatives, with built-in support for complex data transformations, error handling, and a vast library of integrations.
-   **For this specific use case (AI API orchestration):** n8n is a very strong contender, but it might be overkill. The primary task is to receive a webhook, make a few parallel API calls, and return the result. This can be achieved with a much simpler tool like **Node-RED** with less overhead and a simpler setup.

**Conclusion:** If you anticipate your workflows becoming more complex in the future, starting with n8n is a good idea. However, if your goal is to create a simple, lightweight, and easy-to-maintain orchestration layer for this specific use case, **Node-RED is a better and simpler choice.**

---

## 4. Basic Setup for the Simplest Option (Node-RED)

Node-RED can be easily installed on TrueNAS as a Docker container.

### Step-by-Step Docker Setup on TrueNAS:

1.  **Add a new Docker Image:**
    -   In TrueNAS, go to **Docker -> Images** and click **Add**.
    -   **Image repository:** `nodered/node-red`
    -   **Image tag:** `latest`

2.  **Create a new Container:**
    -   Go to **Docker -> Containers** and click **Add**.
    -   **Image:** Select the `nodered/node-red` image you just added.
    -   **Container Name:** `node-red`
    -   **Network:** `Bridge`
    -   **Port Forwarding:**
        -   **Host Port:** `1880`
        -   **Container Port:** `1880`
    -   **Mount a volume for persistent data:**
        -   **Host Path:** Create a dataset on your TrueNAS pool for Node-RED data (e.g., `/mnt/yourpool/apps/nodered`).
        -   **Container Path:** `/data`

3.  **Start the Container:**
    -   Start the container and you can access the Node-RED editor at `http://<your-truenas-ip>:1880`.

### Creating the Workflow:

1.  **Add a `http in` node:** This will create a webhook endpoint. Configure it to accept POST requests.
2.  **Add a `http request` node:** Wire the output of the `http in` node to this node. Configure it to call your AI API.
3.  **Add a `http response` node:** Wire the output of the `http request` node to this node. This will send the response back to the client.
4.  **For parallel calls:** You can split the flow into multiple `http request` nodes and then use a `join` node to combine the results before sending the response.
