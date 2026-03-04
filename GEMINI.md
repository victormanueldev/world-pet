# World Pet - Project Overview

World Pet is a modern full-stack application featuring a premium, dark-themed React frontend and a high-performance FastAPI backend. The project prioritizes design patterns, SOLID principles, and a seamless developer experience.

## 🏗️ Architecture

- **Backend:** Python 3.13, FastAPI, SQLAlchemy (PostgreSQL), Alembic (migrations), UV (package manager).
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (Glassmorphism), Framer Motion, Vitest.

---

## 🛠️ Getting Started

### Backend (Python/FastAPI)
- **Install Dependencies:** `cd backend && uv sync`
- **Run Development Server:** `uv run uvicorn app.main:app --reload`
- **Migrations:** `uv run alembic upgrade head`
- **API Docs:** Available at `http://localhost:8000/api/v1/docs`

### Frontend (React/TypeScript)
- **Install Dependencies:** `cd frontend && npm install`
- **Run Development Server:** `npm run dev` (Available at `http://localhost:5173`)

---

## 🧪 Testing & Quality

### Backend
- **Run Tests:** `uv run pytest`
- **Linting & Formatting:** `uv run ruff check .` and `uv run ruff format .`
- **Type Checking:** `uv run mypy .`

### Frontend
- **Run Tests:** `npm test`
- **Type Checking:** `npm run typecheck`
- **Linting:** `npm run lint`

---

## 📐 Development Conventions & Rules

### Core Mandates
- **SOLID Principles:** Always apply SOLID principles and design patterns for maintainability.
- **Style Guides:**
  - **Python:** Follow PEP 8 strictly. Use `ruff` and `mypy` for validation.
  - **React:** Maintain a premium dark-themed aesthetic with glassmorphism and spring-based animations.
- **Integration:** Backend and frontend JSON payloads **must** always be synchronized to avoid `422` errors. Always validate payloads with `curl` using the OpenAPI spec at `http://localhost:8000/openapi.json` before implementing frontend services.
- **Documentation:** All code must be properly commented.

### Agent Skills & Capabilities
Leverage the following specialized skills available in `.agents/skills/`:
- `fastapi-patterns`: Best practices for FastAPI services and CRUD operations.
- `fronted-ui-ts`: Building dark-themed, animated React interfaces.
- `frontend-unit-testing`: Vitest and React Testing Library guidance.
- `frontend-e2e-testing`: Playwright for end-to-end automation.
- `uv-package-manager`: Instructions for managing Python environments and dependencies with `uv`.
- `prod-owner`: Project vision and requirement management.

---

## 📂 Project Structure

```text
world-pet/
├── backend/            # FastAPI source, migrations, and tests
├── frontend/           # React TypeScript source and UI configuration
├── .sdlc/
  ├── context/                        # Persistent project context
    ├── project-overview.md           # What the system does, tech stack, scope
    ├── architecture.md               # Architecture decisions and patterns
    ├── conventions.md                # Naming, structure, coding standards
  ├── templates/                      # Reusable artifact templates
    ├── requirement-template.md
    ├── task-template.md
  ├── specs/                          # Per-feature specifications
    ├── REQ-*/
      ├── requirement.md              # The spec
      ├── tasks/
        ├── TASK-*/
  ├── knowledge/              # Accumulated project knowledge & answered questions
├── .agents/            # Agent-specific rules and skills
│   ├── rules/          # Coding standards and workflow guides
│   └── skills/         # Specialized capability documentation
└── GEMINI.md           # This file (Context for Gemini CLI)
```
