# Architecture Decisions & Patterns

## Tech Stack
- **Backend**: Python with FastAPI.
- **Frontend**: React with TypeScript and Tailwind CSS.
- **Database**: PostgreSQL (SQLAlchemy as ORM).
- **Rationale**: Ensures high performance, type safety, and industry standards.

## Modular Design
- Codebase is built using Modular Design principle when creating new modules.
- **Deep Modules**: Modules should provide simple interfaces while encapsulating complex functionality.
- **Rationale**: Encourages code reusability and maintainability.

## Backend Architecture Patterns
### Service Layer
- Business logic is encapsulated in `app/services/`.
- Endpoints in `app/api/` should be thin and only handle request/response transformation and dependency injection.
- **Rationale**: Facilitates unit testing of business logic without requiring HTTP context.

### Authentication & Authorization
- **Mechanism**: OAuth2 with Password flow using JWT.
- **Security**: Password hashing using `passlib` with `bcrypt`.
- **RBAC**: Role-based access control implemented via FastAPI dependencies (`get_current_active_superuser`).

## Frontend Architecture Patterns
### State Management
- Global state for cross-cutting concerns (e.g., Auth) is managed using React Context API or specialized libraries like Zustand.
- Local state managed using `useState` / `useReducer`.

### Form Management
- **Library**: `react-hook-form` + `zod` for schema validation.
- **Rationale**: Provides high performance and consistent validation logic.

### Routing
- **Protected Routes**: Custom wrapper components to enforce authentication and authorization at the page level.
