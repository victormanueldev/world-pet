# Product Requirements Document (PRD): World Pet App

## 1. Executive Summary
**World Pet** is a comprehensive pet management platform designed for veterinary clinics and pet service providers. It facilitates the relationship between pet owners and the clinic by providing tools for health tracking, appointment scheduling, and automated reminders via SMS.

## 2. Target Audience
- **Pet Owners (End Users):** Individuals who want to track their pet's health, appointments, and nutrition.
- **Clinic Administrators (Admins):** Staff responsible for managing appointments, grooming services, client data, and outgoing communications.

## 3. Functional Features

### 3.1 User Management & Authentication
- **User Roles:** Distinct roles for "Clients" and "Administrators."
- **Authentication:** Standard secure login, registration, and password recovery.
- **Profile Management:** Users can update their personal information (contact details, address, photo).

### 3.2 Pet Management (Mascotas)
- **Pet Profiles:** Detailed records for each pet, including name, species, breed, sex, photo, birth date, weight, and sterilization status.
- **Multiple Pets:** Users can manage multiple pets under a single account.

### 3.3 Medical Services (Citas)
- **Appointment Booking:** Users can request medical appointments, specifying reasons and preferred dates/times.
- **Symptom Tracking:** Recording initial symptoms or reasons for the visit.
- **Admin Validation:** Administrators can review, confirm, and update the status of medical appointments.

### 3.4 Grooming Services (Peluquería)
- **Service Scheduling:** Booking grooming sessions with specific hair styles or service types.
- **Status Tracking:** Monitoring the progress of grooming services (e.g., pending, completed).
- **Pricing:** Management of service costs within the grooming module.

### 3.5 Nutrition & Feeding (Alimentación)
- **Nutrition Logs:** Tracking the type of food, brand, and quantity consumed by pets.
- **Purchase Tracking:** Recording the last purchase date and calculating the next recommended purchase based on frequency.
- **Automated Reminders:** SMS notifications sent to users when it's time to restock food.

### 3.6 Vaccination Module (Vacunas)
- **Vaccination History:** Records of all vaccines applied to a pet.
- **Vaccine Database:** A reference table of common vaccines and their application frequencies.
- **Application Tracking:** Logging specific application dates and upcoming boosters.

### 3.7 Administrator Tools
- **Client & Pet Directory:** Searchable indexes of all registered users and their pets.
- **Mass Communications:** Ability to send bulk SMS notifications for clinic news or general alerts.
- **SMS Balance Management:** Integration with `hablame.co` API to check remaining credits and manage communication costs.
- **Dashboard:** A central hub for admins to view upcoming appointments and recent activity.

## 5. Modernization Roadmap (AI-Ready)
To facilitate future AI-led modernizations, the following areas should be prioritized:
1.  **API Extraction:** Decouple the frontend from the backend by converting Blade controllers into a RESTful or GraphQL API.
2.  **State Management:** Transition the hybrid Vue.js/Blade setup into a modern Single Page Application (SPA) using Vue 3 or React.
3.  **Automated Scheduling:** Implement an AI-driven scheduling optimizer to minimize appointment gaps.
4.  **Health Predictions:** Use historical vaccination and nutrition data to provide proactive pet health suggestions.
5.  **Service Decoupling:** Move the SMS logic into a dedicated Notification Microservice.