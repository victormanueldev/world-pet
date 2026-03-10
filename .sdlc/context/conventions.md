# Conventions

## SDLC Conventions
- Always use templates to create new requirements and tasks.
- Always read from `context/` to have the full context of the project.
- Use the REQ-ID-feature-name to name requirements.
- Use the TASK-ID-task-name to name tasks.
- Tasks should always have a requirement ID reference.
- Workflows should always be executed in the specified order.
- Read from `knowledge/` to query information if you have any doubts so that User does not have to prompt you the response.

## Coding Conventions
* Use design patterns if apply to make the codebase more maintainable.
* Apply SOLID principles as much as possible.
* Use the fastapi-patterns skill for this.
* Make sure all the code is styled with PEP 8 style guide
* Make sure all the code is properly commented
* Use ruff and mypy to check code style and follow their recommended configuration.

# AI-Driven Development Constraints

AI agents must:

* implement **entities first**
* then **REST API**
* then **admin dashboard**
* then **client UI**

Development order:

```
1. database schema
2. backend API
3. auth
4. admin dashboard
5. client app
6. notifications
```
