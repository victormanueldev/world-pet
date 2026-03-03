---
trigger: always_on
---

* Backend and frontend should always be sync in terms of JSON payloads so that the frontend NEVER has errors of invalid data format or HTTP response 422.
* Always use curl to validate if the payload is valid before adding it to frontend services.
* Use `http://localhost:8000/openapi.json` to get the API specs for backend.