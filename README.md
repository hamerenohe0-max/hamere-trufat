# Hamere Trufat

A comprehensive platform for managing religious content, news, articles, events, and community engagement for the Ethiopian Orthodox Church.

## 🏗️ Architecture

```
hamere-trufat/
├── backend/          # NestJS REST API
├── admin/           # Next.js Admin Panel
├── mobile-app/      # React Native Mobile App (Expo)
└── docs/            # Technical Documentation
```

## 🛠️ Tech Stack

- **Backend**: NestJS, MongoDB, JWT Authentication
- **Admin Panel**: Next.js, React, Tailwind CSS, Shadcn/ui
- **Mobile App**: React Native, Expo, TypeScript
- **Database**: MongoDB (MongoDB Atlas)
- **Deployment**: Railway (backend), Vercel (admin), Expo EAS (mobile)

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

```bash
# Install dependencies for all services
cd backend && npm install && cd ..
cd admin && npm install && cd ..
cd mobile-app && npm install
```

### Running Locally

See `RUN-LOCALLY.md` for complete setup and run instructions.

**Quick start:**
```bash
# Backend (Terminal 1)
cd backend && npm run start:dev

# Admin Panel (Terminal 2)
cd admin && npm run dev

# Mobile App (Terminal 3)
cd mobile-app && npm start
```

## 📚 Documentation

- **Local Development**: `RUN-LOCALLY.md`
- **Deployment**: `DEPLOY.md`
- **Architecture**: `docs/phase-2-architecture.md`
- **Testing**: `docs/testing-guide.md`

## 🚀 Deployment

See `DEPLOY.md` for complete deployment guide.

**Hosting:**
- Backend: Railway (free tier available)
- Admin Panel: Vercel (free tier)
- Database: MongoDB Atlas (free tier)
- Mobile: Expo EAS Build

## 📝 License

Private - All rights reserved

