---
name: fastapi-patterns
description: Build production-grade FastAPI services following clean code, security best practices, and TDD principles. Use when implementing database client setup, service layer classes with CRUD operations, partition key strategies, parameterized queries, or TDD patterns for Cosmos. Triggers on phrases like "database client setup", "service layer classes", "security best practices", "api patterns", or "TDD patterns".
package: fastapi
---

# FastAPI Service Implementation

Build production-grade FastAPI services following clean code, security best practices, and TDD principles.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FastAPI Router                          │
│  - Auth dependencies (get_current_user, get_current_user_required)
│  - HTTP error responses (HTTPException)                         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                        Service Layer                            │
│  - Business logic and validation                                │
│  - Document ↔ Model conversion                                  │
│  - Graceful degradation when DB unavailable                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                     DB Client Module                            │
│  - Singleton container initialization                           │
│  - Async wrapper                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Pydantic Model Hierarchy

Use five-tier model pattern for clean separation:

```python
class ProjectBase(BaseModel):           # Shared fields
    name: str = Field(..., min_length=1, max_length=200)

class ProjectCreate(ProjectBase):       # Creation request
    workspace_id: str = Field(..., alias="workspaceId")

class ProjectUpdate(BaseModel):         # Partial updates (all optional)
    name: Optional[str] = Field(None, min_length=1)

class Project(ProjectBase):             # API response
    id: str
    created_at: datetime = Field(..., alias="createdAt")

class ProjectInDB(Project):             # Internal with docType
    doc_type: str = "project"
```

### 2. Service Layer Pattern

```python
class ProjectService:
    def _use_db(self) -> bool:
        return get_container() is not None
    
    async def get_by_id(self, project_id: str) -> Project | None:
        if not self._use_db():
            return None
        result = await get_by_id(project_id)
        if result is None:
            return None
        return self._result_to_model(result)
```

**Full patterns**: See [references/service-layer.md](references/service-layer.md)

## Core Principles

### Security Requirements

1. **RBAC Authentication**: Enforce role-based access control using Casbin
2. **Parameterized Queries**: Use parameterized queries to prevent SQL injection

### Clean Code Conventions

1. **Single Responsibility**: Client module handles connection; services handle business logic
2. **Graceful Degradation**: Services return `None`/`[]` when Cosmos unavailable
3. **Consistent Naming**: `_result_to_model()`, `_model_to_result()`, `_use_db()`
4. **Type Hints**: Full typing on all public methods
5. **CamelCase Aliases**: Use `Field(alias="camelCase")` for JSON serialization

### TDD Requirements

Write tests BEFORE implementation using these patterns:

```python
@pytest.fixture
def mock_db_container(mocker):
    container = mocker.MagicMock()
    mocker.patch("app.db.psql.get_container", return_value=container)
    return container

@pytest.mark.asyncio
async def test_get_project_by_id_returns_project(mock_db_container):
    # Arrange
    mock_db_container.read_item.return_value = {"id": "123", "name": "Test"}
    
    # Act
    result = await project_service.get_by_id("123", "workspace-1")
    
    # Assert
    assert result.id == "123"
    assert result.name == "Test"
```

**Full testing guide**: See [references/testing.md](references/testing.md)

## Reference Files

| File | When to Read |
|------|--------------|
| [references/service-layer.md](references/service-layer.md) | Implementing full service class with CRUD, conversions, graceful degradation |
| [references/testing.md](references/testing.md) | Writing pytest tests, mocking Cosmos, integration test setup |
| [references/error-handling.md](references/error-handling.md) | Handling CosmosResourceNotFoundError, logging, HTTP error mapping |

## Template Files

| File | Purpose |
|------|---------|
| [assets/service_template.py](assets/service_template.py) | Service class skeleton |
| [assets/conftest_template.py](assets/conftest_template.py) | pytest fixtures for DB mocking |

## Quality Attributes (NFRs)

### Reliability
- Graceful degradation when DB unavailable
- Retry logic with exponential backoff for transient failures
- Connection pooling via singleton pattern

### Security
- Zero secrets in code (RBAC via Casbin)
- Parameterized queries prevent injection

### Maintainability
- Five-tier model pattern enables schema evolution
- Service layer decouples business logic from storage
- Consistent patterns across all entity services

### Testability
- Dependency injection via `get_container()`
- Easy mocking with module-level globals
- Clear separation enables unit testing without DB

### Performance
- Async wrapping prevents blocking FastAPI event loop
