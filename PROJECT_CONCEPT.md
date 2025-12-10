# Project Concept: The Dynamic Danish Producer Directory

## 1. Vision

To create the most intelligent and comprehensive directory of Danish production firms, making it effortless for buyers to find the exact production capabilities they need. The platform will be a living system that continuously evolves its data and search relevance through AI and user interaction.

## 2. Core Idea: The Self-Evolving Directory

The key differentiator for this platform is its ability to grow and refine itself automatically. The core workflow is as follows:

1.  **User Search:** A user enters a search query. This could be a company name, a specific production capability (e.g., "bending 20mm steel plates"), or a product need ("custom steel pipes 50cm diameter").
2.  **Database Query:** The system searches its existing library of producer profiles for relevant matches.
3.  **The "Discovery Agent" (AI Process):**
    *   **Trigger:** If a user searches for a company not in the database, or if the existing data is insufficient to meet a specific capability search, the Discovery Agent is activated.
    *   **Information Gathering:** The agent scours the public internet (company websites, industry news, public records) to gather data on the target company.
    *   **Data Extraction & Structuring:** It identifies and extracts key production parameters. For the initial focus on steel and pipes, this includes:
        *   **Welding:** Max/min plate thickness, materials (stainless, carbon steel, etc.).
        *   **Bending/Rolling:** Max thickness, max length, min/max radius.
        *   **Cutting (Laser, Plasma, Waterjet):** Max thickness, bed size.
        *   **Pipes:** Diameter ranges, length capabilities, material types.
        *   **Production Capacity:** Overall output, factory size, number of employees (as proxies for capacity).
        *   **Certifications:** ISO standards, industry-specific certs.
    *   **Profile Creation:** The extracted data is used to create a new, preliminary company profile in the database.
4.  **Connecting Buyer & Seller:** When a user finds a suitable producer and wishes to connect, the platform facilitates this.
5.  **Seller-Driven Refinement:**
    *   Upon a successful connection (lead), the producer is invited to claim and enrich their profile.
    *   The system will intelligently prompt them for information that is frequently searched for by buyers or that is present in the profiles of similar, successful producers on the platform. This creates a feedback loop, continuously improving data quality.
6.  **Adaptive Search Algorithm:**
    *   The search algorithm will learn from user behavior.
    *   It will track which search terms lead to successful connections.
    *   Over time, it will give more weight to the parameters that users search for most often, refining what data the Discovery Agent looks for and what it prompts sellers to provide.

## 3. Initial Focus: Steel & Pipe Fabrication

The initial version of the platform will concentrate on Danish companies involved in the production of steel structures and pipes.

### Key Data Points for Steel/Pipe Producers:

*   **Company Information:** Name, CVR, Address, Contact Info.
*   **Core Processes:** Welding, Bending, Cutting, Machining, Surface Treatment.
*   **Specific Capabilities (Parameters):**
    *   **Plate Thickness (mm):** For various processes.
    *   **Pipe Diameter (mm):** For various processes.
    *   **Max/Min Dimensions (Length, Width):**
    *   **Material Types:** (e.g., S355 Steel, 316L Stainless)
    *   **Production Capacity:** (e.g., tons/month, hours/week)
    *   **Certifications:** (e.g., EN 1090, ISO 9001)

## 4. High-Level System Structure

This suggests a multi-part system architecture:

1.  **Web Frontend:** A clean, search-focused user interface (e.g., built with React, Vue, or similar).
2.  **Backend API:** A service to handle user requests, query the database, and trigger the AI agent.
3.  **Producer Database:** A database (e.g., PostgreSQL) to store structured company profiles.
4.  **Discovery Agent:** An AI-powered microservice or serverless function responsible for web scraping, data extraction (using LLMs), and populating the database.
5.  **Analytics & Learning Module:** A system to analyze search queries and user behavior to feed back into the search algorithm and data-gathering priorities.

## 5. Next Steps / Roadmap

1.  **Refine Project Concept:** Solidify the core features and data model for the MVP (Minimum Viable Product).
2.  **Technology Selection:** Choose the specific technologies for the frontend, backend, and database.
3.  **MVP Scaffolding:** Set up the basic project structure, repositories, and initial database schema.
4.  **Develop Core Search & Profile Display:** Build the basic functionality to search and view static company profiles.
5.  **Develop Discovery Agent v1:** Create the first version of the AI agent to find and add a new company.
6.  **Develop Seller Portal:** Build the interface for sellers to claim and edit their profiles.
