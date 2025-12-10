# Data Sources for Danish Industrial Companies

This document outlines available data sources for finding and extracting information about Danish industrial/manufacturing companies, with a focus on steel and pipe fabricators.

## Goal: Discovery Agent

The objective is to build a "Discovery Agent" that can automatically find and extract the following information:
-   Company details (name, CVR number, address, contact)
-   Manufacturing capabilities (welding, bending, cutting, etc.)
-   Certifications (ISO, EN standards)
-   Production capacity

---

## 1. Data Sources Ranked by Usefulness

1.  **Official Business Registries (CVR):** The most reliable source for basic company information (name, address, CVR number).
2.  **Industry-Specific Portals and Directories:** High-value targets for finding companies in a specific sector and their capabilities.
3.  **Company Websites:** The primary source for detailed manufacturing capabilities, certifications, and capacity.
4.  **Google Maps/Business Listings:** Good for finding company locations and basic contact information.
5.  **LinkedIn:** Useful for finding company employees and getting a sense of the company's size and focus.

---

## 2. Official Danish Business Registries

The **CVR (Central Business Register)** is the official source of information about all Danish companies.

### CVR API Access

-   **Official CVR API (from Erhvervsstyrelsen):** The Danish Business Authority provides free system-to-system access to the CVR. However, the documentation can be complex and the API may be difficult to integrate with.
-   **Third-Party CVR APIs:** Several companies offer user-friendly REST APIs for accessing CVR data. These are often easier to use and have better documentation. Examples include:
    -   [cvr.dev](https://cvr.dev)
    -   [Virkdata](https://virkdata.dk)
    -   [LassoX](https://lassox.com)

**Recommendation:** For ease of use, starting with a third-party CVR API is recommended. `cvr.dev` offers a modern REST API with a 30-day free trial.

---

## 3. Industry-Specific Sources & Web Scraping Targets

### Industry Associations

-   **Confederation of Danish Industry (DI):** A major organization representing many manufacturing companies. Their member directory could be a valuable source.
-   **Dansk Stålinstitut (Danish Steel Institute):** Focused on steel and steel construction. Their publications and member lists could be highly relevant.

### Online Directories (Web Scraping Targets)

-   **Ezilon.com, Ensun.io, World of Manufacturers:** These directories list Danish manufacturing companies and are good starting points for finding company names and websites.
-   **Company Websites:** The most important source for detailed information. The "Discovery Agent" should be designed to crawl company websites and look for pages like "About Us," "Capabilities," "Services," and "Certifications."
-   **Google Maps & Business Listings:** Can be used to find basic company information and to verify addresses.
-   **LinkedIn:** Useful for finding company size, number of employees, and recent news.

---

## 4. Legal Considerations (GDPR)

Web scraping in the EU is subject to the **General Data Protection Regulation (GDPR)**. Here are the key takeaways:

-   **Company Data vs. Personal Data:** Scraping general company information (e.g., company name, address, industry) is generally acceptable. However, if the data can be linked to an individual (e.g., an employee's name, email address, or job title), it is considered **personal data** and is subject to GDPR.
-   **Lawful Basis for Processing:** You must have a lawful basis to process personal data. For web scraping, "legitimate interest" is the most likely basis, but it requires a careful balancing act between your interests and the individual's right to privacy.
-   **Transparency:** You are required to inform individuals that you are processing their data, which is very difficult to do when scraping.
-   **Data Minimization:** Only collect the data you absolutely need for your specific purpose.
-   **Terms of Service:** Always check the terms of service of the websites you are scraping. Many websites explicitly prohibit scraping.

**Recommendation:** To minimize legal risks, focus on scraping **non-personal company data**. Avoid collecting and storing information about specific employees. If you do collect personal data, you must have a clear legal basis and a plan for complying with all GDPR requirements. **Consult with a legal professional before starting any large-scale scraping project.**

---

## 5. Recommended Scraping Strategy & Workflow

Here is a recommended workflow for the "Discovery Agent":

1.  **Seed the Agent with a list of company names:**
    -   Start with a list of companies from an industry directory (e.g., Ensun.io).
    -   Use the CVR API to get the official company name and CVR number for each.

2.  **Find the company website:**
    -   Use a search engine API (like Google Custom Search) to find the official website for each company.

3.  **Crawl the website:**
    -   Use a web scraping tool (like BeautifulSoup in Python) to crawl the company's website.
    -   Look for keywords related to manufacturing capabilities (e.g., "welding," "laser cutting," "CNC machining") and certifications (e.g., "ISO 9001," "EN 1090").

4.  **Extract and Structure Data with AI:**
    -   For each relevant page, send the HTML content to an AI API (like GPT-4o or Claude 3 Sonnet).
    -   Use a carefully crafted prompt with **JSON mode** to instruct the AI to extract the specific information you need and structure it as a JSON object.

5.  **Store the data:**
    -   Store the structured JSON data in your database.

6.  **Repeat:**
    -   The agent can then look for links to other companies on the crawled websites and add them to the queue, creating a self-expanding discovery process.

### Recommended Tools:

-   **Python:** The ideal language for this task.
-   **Requests & BeautifulSoup:** For fetching and parsing HTML.
-   **OpenAI/Anthropic/Google AI SDKs:** For calling the AI APIs.
-   **A third-party CVR API:** For easy access to the Danish business register.
-   **A database:** (e.g., PostgreSQL) to store the collected data.
