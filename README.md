# 💍 Online Wedding Invitation Builder

A modern web platform that enables couples to create, customize, and publish interactive wedding invitation websites without coding. The platform provides a drag-and-drop editor, customizable templates, RSVP management, guest wishes, photo galleries, event timelines, and QR-based wedding gift information.

---

## ✨ Features

### 🎨 Wedding Invitation Builder

* Drag-and-drop editor for invitation customization
* Template-based design system
* Real-time preview
* Image upload and management
* Custom fonts, colors, and layouts

### 🌐 Dynamic Wedding Website

* Personalized invitation URL
* Responsive design for mobile and desktop
* Wedding countdown timer
* Event timeline and schedule
* Interactive Google Maps integration

### 👥 Guest Engagement

* RSVP confirmation form
* Guest wishes and messages
* Wedding photo gallery
* QR code for wedding gift information

### 🤖 AI Assistance

* AI-generated wedding invitation content
* Personalized invitation messages
* Writing style suggestions

---

## 🏗️ System Architecture

```text
Frontend (Next.js)
        │
        ▼
REST API (NestJS)
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL Database
        │
        ▼
Supabase Storage
```

---

## 🛠️ Tech Stack

### Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* Fabric.js
* Framer Motion

### Backend

* NestJS
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Swagger API Documentation

### Infrastructure

* Supabase Storage
* Vercel Deployment
* GitHub Actions (Optional)

---

## 📂 Project Structure

```text
Online-Wedding-Invitation-Builder/
│
├── wedding-frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── wedding-backend/
│   ├── src/
│   ├── prisma/
│   └── package.json
│
├── docs/
│   ├── ERD
│   ├── UseCase
│   ├── SequenceDiagram
│   └── ActivityDiagram
│
└── README.md
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/your-username/Online-Wedding-Invitation-Builder.git
cd Online-Wedding-Invitation-Builder
```

### Backend Setup

```bash
cd wedding-backend

npm install

cp .env.example .env

npx prisma migrate dev

npm run start:dev
```

### Frontend Setup

```bash
cd wedding-frontend

npm install

npm run dev
```

Frontend:
http://localhost:3000

Backend:
http://localhost:3001

---

## 📸 Preview

### Homepage

* Template Gallery
* Wedding Invitation Showcase

### Editor

* Drag & Drop Components
* Real-Time Customization
* Image Upload

### Published Invitation

* Dynamic Wedding Website
* RSVP Form
* Guest Wishes
* QR Wedding Gift

---

## 👨‍💻 Team Members

* Project Manager & Editor Module
* Frontend Developer
* Backend Developer
* UI/UX & Template Designer

---

## 📄 License

This project is developed for educational and internship purposes.
