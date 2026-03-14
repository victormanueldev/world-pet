# Service Layer Pattern

## Table of Contents

1. [Service Class Structure](#service-class-structure)
2. [CRUD Operations](#crud-operations)
3. [Graceful Degradation](#graceful-degradation)

---

## Service Class Structure

Every service follows this pattern:

```python
from typing import Optional
from app.db.postgres import get_container, update, get, delete, query
from app.models.project import Project, ProjectCreate, ProjectUpdate, ProjectInDB

class ProjectService:
    """Service for project CRUD operations."""
    
    def _use_postgres(self) -> bool:
        """Check if Postgres is available."""
        return get_container() is not None
    
    # CRUD operations
    async def create(self, data: ProjectCreate, author_id: str) -> Project:
        ...
    
    async def get_by_id(self, project_id: str, workspace_id: str) -> Optional[Project]:
        ...
    
    async def update(self, project_id: str, workspace_id: str, data: ProjectUpdate) -> Optional[Project]:
        ...
    
    async def delete(self, project_id: str, workspace_id: str) -> bool:
        ...
    
    async def list_by_workspace(self, workspace_id: str) -> list[Project]:
        ...

# Singleton instance
project_service = ProjectService()
```

---

## CRUD Operations

### Create

```python
async def create(self, data: ProjectCreate, author_id: str) -> Project:
    """Create a new project."""
    if not self._use_postgres():
        raise RuntimeError("Database unavailable")
    
    now = datetime.now(timezone.utc)
    slug = await self._generate_unique_slug(data.name, data.workspace_id)
    
    project_in_db = ProjectInDB(
        id=str(uuid.uuid4()),
        name=data.name,
        description=data.description,
        slug=slug,
        workspace_id=data.workspace_id,
        author_id=author_id,
        visibility=data.visibility,
        tags=data.tags,
        created_at=now,
        updated_at=None,
        doc_type="project",
    )
    
    await upsert(project_in_db)
    
    return project_in_db
```

### Read (Get by ID)

```python
async def get_by_id(self, project_id: str, workspace_id: str) -> Optional[Project]:
    """Get project by ID. Returns None if not found."""
    if not self._use_postgres():
        return None
    
    doc = await get(project_id)
    if doc is None:
        return None
    
    return doc
```

### Update

```python
async def update(
    self, project_id: str, workspace_id: str, data: ProjectUpdate
) -> Optional[Project]:
    """Update project. Returns None if not found."""
    if not self._use_postgres():
        return None
    
    doc = await get(project_id)
    if doc is None:
        return None
    
    # Apply updates (only non-None fields)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(doc, field):
            setattr(doc, field, value)
    
    doc.updated_at = datetime.now(timezone.utc)
    
    await upsert(doc)
    
    return doc
```

### Delete

```python
async def delete(self, project_id: str, workspace_id: str) -> bool:
    """Delete project. Returns True if deleted."""
    if not self._use_postgres():
        return False
    
    return await delete(project_id)
```

### List

```python
async def list_by_workspace(self, workspace_id: str) -> list[Project]:
    """List all projects in a workspace."""
    if not self._use_postgres():
        return []
    
    docs = await query(
        doc_type="project",
        partition_key=workspace_id,
    )
    
    return docs
```

## Graceful Degradation

Every public method checks `_use_postgres()` and returns safe defaults:

| Return Type | Default |
|-------------|---------|
| `Optional[Model]` | `None` |
| `list[Model]` | `[]` |
| `bool` | `False` |
| Required create | `raise RuntimeError` |

```python
async def get_by_id(self, project_id: str, workspace_id: str) -> Optional[Project]:
    if not self._use_postgres():
        return None  # Graceful None instead of exception
    ...
```

---