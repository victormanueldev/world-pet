# World Pet Backend

Backend API for the World Pet application, built with **FastAPI**, **Python 3.13**, and **Alembic** for migrations.

## 🚀 Quick Start

### Prerequisites
- [Python 3.13+](https://www.python.org/downloads/)
- [uv](https://github.com/astral-sh/uv) (Extremely fast Python package manager)

### Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    uv sync
    ```

3.  Configure environment variables:
    The project expects a `.env` file in the `backend/` directory.

### Running the Application

Start the development server with hot-reload:
```bash
uv run uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.
Swagger documentation: `http://localhost:8000/api/v1/docs`

## 🛠️ Development Tools

### Linting & Formatting
We use **Ruff** for fast linting and formatting (following PEP 8).
```bash
uv run ruff check .        # Check for issues
uv run ruff format .       # Format code
```

### Type Checking
We use **Mypy** for static type analysis.
```bash
uv run mypy .
```

### Testing
We use **Pytest** for asynchronous testing.
```bash
uv run pytest
```

## 🗄️ Database Migrations

This project uses **Alembic** for database schema versioning.

### Create a new migration
After modifying SQLAlchemy models, generate a new migration script:
```bash
uv run alembic revision --autogenerate -m "description of changes"
```

### Apply migrations
```bash
uv run alembic upgrade head
```

## 📂 Project Structure

```
backend/
├── alembic/              # Database migration scripts
├── app/                  # Application source code
│   ├── api/              # API Route definitions
│   │   └── v1/           # Version 1 of the API
│   ├── core/             # Core configurations (Settings, Security)
│   ├── db/               # Database session and Base model
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic schemas (DToS)
│   ├── services/         # Business logic layer
│   └── main.py           # Application entry point
├── tests/                # Automated tests
└── pyproject.toml        # Dependencies and tool configurations
```
