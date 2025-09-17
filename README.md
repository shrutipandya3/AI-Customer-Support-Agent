# 🧠 Minimal AI Customer Support Agent

A **full-stack TypeScript chat application** that lets users sign up, log in, and chat with an AI-powered customer support agent.  
Users can view previous conversations, append new messages, and see a typing indicator when the AI is responding.

---

## 🚀 Features

### 👤 Authentication
- Signup / Login / Logout using **JWT**
- Passwords hashed with **bcrypt**
- Protected routes for authenticated users

### 🖥️ Backend (Node.js + TypeScript)
- Stores chat history in **MongoDB** (Dockerized)
- Uses **Redis** (Dockerized) for caching / session management
- Fully typed with **TypeScript**
- Integrated with **OpenRouter.ai GPT-4o model** for AI responses

### 🌐 Frontend (React + TypeScript)
- UI built with **Tailwind CSS**
- Displays chat history and new AI responses
- Shows typing indicator when AI is responding

---

## ⚙️ Tech Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React + TypeScript + Tailwind CSS |
| Backend    | Node.js + Express + TypeScript |
| Database   | MongoDB (Docker) |
| Cache      | Redis (Docker) |
| Auth       | JWT + Bcrypt |
| AI         | OpenRouter.ai GPT-4o |
| DevOps    | Docker + Docker Compose |

---

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone <repo-url>
cd <repo-folder>
cp .env.example .env
```

Fill in your MongoDB URI, Redis config, JWT secret, and OpenRouter API key.

2. **Run the app**

### Option 1: Development mode (local)

1. **Server**

```bash
cd server
npm install
npm run dev
```

2. **Client**

```bash
cd client
npm install
npm run dev
```

### Option 2: Using Docker (development or production)

```bash
docker-compose up --build
```

Open the app in your browser at: http://localhost:3000

## 📁 Repository Structure

```bash
client/        # React frontend
server/        # Node.js backend
.env.example   # Example environment variables
```
