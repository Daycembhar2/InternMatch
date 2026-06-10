<div align="center">

<img src="https://img.shields.io/badge/InternMatch-Internship%20%26%20Job%20Platform-4F46E5?style=for-the-badge&logoColor=white" alt="InternMatch Banner"/>

# 🎯 InternMatch

### AI-Powered Internship & Job Recommendation Platform

*Connecting students, companies, and universities through intelligent matching*

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)

</div>

---

## 📌 Overview

**InternMatch** is a full-stack web platform designed to simplify and modernize the internship and job application process for students, companies, and university staff. Built during an internship at **Vibracom (2026)**, the platform leverages AI to match candidates with the most relevant opportunities based on their CV and profile.

> 💡 **Problem it solves:** Students waste hours applying to irrelevant positions. Companies receive hundreds of unqualified applications. Universities struggle to track internship workflows. InternMatch fixes all three.

---

## ✨ Features

### 👨‍🎓 For Students
- 📄 **CV Analysis** — AI-powered parsing and scoring of uploaded CVs
- 🤖 **Smart Recommendations** — Personalized internship & job suggestions
- 📬 **Application Management** — Track status of all applications in one place
- ✅ **Task Tracking** — Monitor assigned tasks during active internships

### 🏢 For Companies
- 📢 **Job & Internship Posting** — Create and manage offers with rich descriptions
- 🔍 **Candidate Discovery** — Browse matched candidates ranked by AI score
- 📋 **Application Review** — Accept, reject, or shortlist applicants

### 🎓 For University Staff
- 📊 **Internship Validation** — Review and approve student internship agreements
- 📈 **Dashboard Analytics** — Track placement rates and student progress
- 🗂️ **Convention Management** — Handle all administrative workflows digitally

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 17, TypeScript, Bootstrap 5 |
| **Backend API** | Spring Boot 3, Java 17, REST APIs |
| **AI Service** | FastAPI, Python 3.11, NLP |
| **Database** | MySQL 8, JPA / Hibernate |
| **Auth** | JWT (JSON Web Tokens) |
| **Testing** | Manual Testing, Bug Reporting |
| **Methodology** | Agile (Scrum), UML |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Angular Frontend                   │
│         (Student | Company | University)             │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
          ┌────────────┴────────────┐
          │                         │
┌─────────▼──────────┐   ┌─────────▼──────────┐
│   Spring Boot API  │   │   FastAPI AI Service│
│   (Core Business)  │   │  (CV Analysis + ML) │
└─────────┬──────────┘   └─────────────────────┘
          │
┌─────────▼──────────┐
│     MySQL Database  │
│  (Users, Jobs, CVs) │
└─────────────────────┘
```

---

## 📁 Project Structure

```
InternMatch/
├── frontend/                  # Angular application
│   ├── src/app/
│   │   ├── student/           # Student dashboard & pages
│   │   ├── company/           # Company dashboard & pages
│   │   ├── university/        # University staff pages
│   │   ├── auth/              # Login, register, JWT guard
│   │   └── shared/            # Reusable components
├── backend/                   # Spring Boot API
│   ├── src/main/java/
│   │   ├── controllers/       # REST endpoints
│   │   ├── services/          # Business logic
│   │   ├── models/            # JPA entities
│   │   └── repositories/      # Data access layer
└── ai-service/                # FastAPI microservice
    ├── main.py                # API entry point
    ├── cv_parser.py           # CV analysis logic
    └── recommender.py         # Matching algorithm
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- Python 3.11+
- MySQL 8+

### 1. Clone the repository

```bash
git clone https://github.com/Daycembhar2/InternMatch.git
cd InternMatch
```

### 2. Start the database

```sql
CREATE DATABASE internmatch_db;
```

### 3. Run the Spring Boot backend

```bash
cd backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### 4. Run the FastAPI AI service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 5. Run the Angular frontend

```bash
cd frontend
npm install
ng serve
# Runs on http://localhost:4200
```

---

## 🔑 Environment Variables

Create a `.env` file in `/backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/internmatch_db
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASSWORD
jwt.secret=YOUR_JWT_SECRET
```

---

## 👤 Author

**Bhar Daycem**
Full-Stack Developer | Software Engineering Student

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/daycem-bhar)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Daycembhar2)

---

## 📄 License

This project was developed as part of a professional internship at **Vibracom (2026)**.
All rights reserved © 2026 Bhar Daycem.

---

<div align="center">
  <sub>Built with ❤️ in Tunisia 🇹🇳</sub>
</div>
