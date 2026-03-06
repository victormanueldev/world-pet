Below is a **concise, AI-friendly PRD for an MVP** using **Spec Driven Development (SDD)**. It is structured to be **clear for AI agents**, **minimize tokens**, and **support incremental code generation**.

---

# PRD — World Pet MVP

## 1. Product Overview

**World Pet** is a pet management platform for veterinary clinics and pet owners.

The MVP enables:

* Pet owners to manage pets and request appointments
* Clinics to manage clients, pets, and appointments
* Automated reminders for vaccines and food purchases

The system consists of:

* **Client Web - Mobile Responsive**
* **Admin Web Backoffice**
* **Backend API**
* **Notification Service (SMS abstraction)**

---

# 2. Goals

### Business Goals

* Digitize veterinary clinic operations
* Improve client communication
* Track pet health history

### MVP Success Metrics

| Metric                    | Target   |
| ------------------------- | -------- |
| Registered clients        | >50      |
| Pets registered           | >100     |
| Appointments booked       | >20/week |
| Reminder delivery success | >95%     |

---

# 3. User Roles

## Client

Pet owner using the app.

Capabilities:

* Manage pets
* Book appointments
* Track pet health
* Receive reminders

## Administrator

Clinic staff managing operations.

Capabilities:

* Manage clients
* Manage pets
* Manage appointments
* Manage vaccines
* Send notifications

---

# 4. Core Entities (Data Model)

### User

```
id
role (client|admin)
name
email
phone
password_hash
created_at
```

### Pet

```
id
owner_id
name
species
breed
sex
birth_date
weight
sterilized
photo_url
created_at
```

### Appointment

```
id
pet_id
owner_id
type (medical|grooming)
reason
status (requested|confirmed|completed|cancelled)
scheduled_at
created_at
```

### GroomingService

```
id
name
description
price
duration_minutes
```

### NutritionLog

```
id
pet_id
food_brand
food_type
quantity
last_purchase_date
purchase_frequency_days
```

### Vaccine

```
id
name
description
frequency_days
```

### VaccineApplication

```
id
pet_id
vaccine_id
applied_at
next_due_date
```

### Notification

```
id
user_id
type (sms)
content
status (pending|sent|failed)
sent_at
```

---

# 5. Functional Requirements

## 5.1 Authentication

### Client

* Register account
* Login
* Reset password
* Update profile

### Admin

* Login
* Manage profile

---

## 5.2 Pet Management

Client can:

* Create pet
* Edit pet
* View pets
* Delete pet

Pet profile shows:

* basic info
* vaccination history
* appointments
* nutrition logs

---

## 5.3 Appointment Scheduling

Client can:

* request appointment
* select pet
* select type (medical/grooming)
* provide reason

Admin can:

* view appointment list
* filter by date/status
* confirm appointment
* reschedule appointment
* cancel appointment
* mark completed

---

## 5.4 Grooming Services

Admin can:

* create grooming services
* edit grooming services
* delete grooming services

Client can:

* request grooming appointment

---

## 5.5 Vaccination Module

Admin can:

* manage vaccine catalog

Admin can record:

* vaccine applied to pet

System automatically calculates:

```
next_due_date = applied_at + frequency_days
```

Client can:

* view vaccination history

---

## 5.6 Nutrition Tracking

Client can:

* log pet food
* update purchase date
* update purchase frequency

System calculates:

```
next_purchase = last_purchase_date + purchase_frequency_days
```

---

## 5.7 Notifications

System sends SMS for:

### Vaccine Reminder

```
if today >= next_due_date - 3 days
```

### Food Reminder

```
if today >= next_purchase
```

### Appointment Reminder

```
24h before scheduled_at
```

Notification sending is abstracted via:

```
NotificationService.sendSMS(phone, message)
```

---

# 6. Admin Backoffice Pages

### Dashboard

Displays:

* appointments today
* upcoming vaccines
* upcoming food reminders
* total clients
* total pets

---

### Clients

Admin can:

* search clients
* view client profile
* view pets of client

---

### Pets

Admin can:

* search pets
* view pet profile
* view vaccine history
* view appointments

---

### Appointments

Admin can:

* filter by date/status
* confirm appointments
* cancel appointments
* mark completed

---

### Vaccines

Admin can:

* create vaccine
* edit vaccine
* delete vaccine

---

### Grooming Services

Admin can:

* create service
* edit service
* delete service

---

# 7. Client App Pages

### Authentication

* login
* register
* reset password

---

### Home

Shows:

* pets
* upcoming appointments
* vaccine reminders
* food reminders

---

### Pets

* list pets
* create pet
* edit pet
* view pet details

---

### Appointments

* request appointment
* view upcoming appointments
* view past appointments

---

### Vaccines

* vaccination history

---

### Nutrition

* log food purchase
* update frequency

---

### Profile

* view profile
* edit profile

---

# 8. Non-Functional Requirements

### Security

* JWT authentication
* password hashing (bcrypt)

### Performance

* API response < 500ms

### Scalability

* stateless backend
* notification service isolated

### Reliability

* retry failed SMS notifications

---

# 9. API Principles

* RESTful endpoints
* JSON payloads
* versioned API `/v1`

Example:

```
POST /v1/pets
GET /v1/pets/{id}
POST /v1/appointments
GET /v1/appointments
```

---

# 10. Suggested Tech Stack (AI Friendly)

Backend

```
Python
FastAPI
PostgreSQL
SQLAlchemy
```

Frontend

```
Next.js
React
Tailwind
```

Auth

```
JWT
OAuth (Google)
```

Infra

```
Docker
```
---

# 11. Future AI Roadmap

### AI Features (post-MVP)

* Pet health prediction
* Smart appointment scheduling
* Nutrition recommendations
* Chatbot veterinary assistant