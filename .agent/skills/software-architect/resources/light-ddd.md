## Light Domain-Driven Design (Light-DDD)

**Light-DDD** is a pragmatic architectural pattern designed to capture the core benefits of Domain-Driven Design (DDD) without the overhead of its more complex tactical patterns. It focuses on **clarity of intent** and **separation of concerns** by organizing code around business logic rather than technical layers.

For an AI agent, Light-DDD provides a predictable structure for identifying where business rules live (the "Domain") versus where data is fetched (the "Infrastructure").

### Key Principles

* **Ubiquitous Language:** Use the same terms in the code that business stakeholders use.
* **Domain Centricity:** The core logic (Entities and Services) has zero dependencies on external frameworks or databases.
* **Flat Structure:** Avoids complex "Aggregates" or "Value Objects" unless they are strictly necessary for data integrity.

---