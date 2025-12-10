# Dynamic Danish Producer Directory

This project is a web platform to intelligently search for and connect with Danish industrial production companies. The full project concept can be found in `PROJECT_CONCEPT.md`.

## Technology Stack

This project will be built as a monorepo to manage the different services (frontend, backend, agent).

*   **Monorepo Management:** `npm` workspaces.
*   **Frontend:**
    *   Framework: React (with Vite)
    *   Language: TypeScript
    *   Styling: Tailwind CSS
*   **Backend:**
    *   Runtime: Node.js (with `ts-node` for development)
    *   Framework: Express.js
    *   Language: TypeScript
    *   Database ORM: Prisma
*   **Database:**
    *   Engine: PostgreSQL
*   **Discovery Agent (AI Service):**
    *   Runtime: Python
    *   Libraries: `requests`, `BeautifulSoup4` for scraping, and a client for a Generative AI model for data extraction.

## Project Structure

The project will be organized into packages within a `packages` directory:

```
/
|-- packages/
|   |-- frontend/      # React web application
|   |-- backend/       # Express.js API server
|   |-- agent/         # Python-based AI discovery agent
|-- .gitignore
|-- package.json       # Root package.json for monorepo setup
|-- PROJECT_CONCEPT.md
|-- README.md
```

## Getting Started

1.  **Install Dependencies:** `npm install` in the root directory.
2.  **Setup Environment:** Each package will have its own `.env` file for configuration (e.g., database URLs, API keys).
3.  **Run Services:** Use `npm run dev --workspace=<package_name>` to start a specific service.
