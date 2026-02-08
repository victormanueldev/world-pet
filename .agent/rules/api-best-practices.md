---
trigger: always_on
---

1. Use only standard HTTP methods.
2. When designing an API, consider the following (roughly in logical order):
    - The resources (nouns) the API will provide
    - The relationships and hierarchies between those resources
    - The schema of each resource
    - The methods (verbs) each resource provides, relying as much as possible on the standard verbs
3. Implement error responses using this JSON:
```json
{
  "error": {
    "code": 429,
    "message": "The zone 'us-east1-a' does not have enough resources available to fulfill the request. Try a different zone, or try again later.",
    "status": "RESOURCE_EXHAUSTED",
    "details": [
      {
        "reason": "RESOURCE_AVAILABILITY",
        "domain": "compute.googleapis.com",
        "metadata": {
          "module_name": "auth",
        }
      },
    ]
  }
}
```
4. For API versioning, API interfaces must provide a major version number, ex: v1, v2, v3.