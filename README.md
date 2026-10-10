# Rokto Britto (রক্ত বৃত্ত) - Location Based Live Blood Info Application

A real-time emergency blood dispatch platform built with **Next.js**, **Express**, **Prisma ORM**, **PostgreSQL**, and **Socket.io**.

---

## 🏗️ Modular Architecture Overview

The backend uses a clean, feature-driven modular architecture (`src/modules/<feature>/`):

```
rokto-britto/
├── server/
│   ├── src/
│   │   ├── config/                     # All Environment & Connection configurations
│   │   │   ├── env.config.ts           # Typed environment variables (app, db, jwt, rules)
│   │   │   ├── prisma.config.ts        # Prisma client singleton instance
│   │   │   └── index.ts                # Centralized configuration exports
│   │   │
│   │   ├── modules/                    # Feature Modules (Service - Controller - Router pattern)
│   │   │   ├── health/
│   │   │   │   ├── health.service.ts   # System uptime, memory, status calculations
│   │   │   │   ├── health.controller.ts# Express HTTP response handler
│   │   │   │   └── health.router.ts    # GET /api/health
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts     # User registration, login, JWT token issuing
│   │   │   │   ├── auth.controller.ts  # Express HTTP handler
│   │   │   │   └── auth.router.ts      # POST /api/auth/login, GET /api/auth/profile
│   │   │   ├── request/
│   │   │   │   ├── request.service.ts  # Haversine 20km math & emergency dispatch
│   │   │   │   ├── request.controller.ts
│   │   │   │   └── request.router.ts   # /api/requests
│   │   │   ├── donor/
│   │   │   │   ├── donor.service.ts    # Scheduling commitments & availability
│   │   │   │   ├── donor.controller.ts
│   │   │   │   └── donor.router.ts     # /api/donors
│   │   │   ├── chat/
│   │   │   │   ├── chat.service.ts     # Anti-Spam 1-message rule protocol
│   │   │   │   ├── chat.controller.ts
│   │   │   │   └── chat.router.ts      # /api/chats
│   │   │   ├── bloodBank/
│   │   │   │   ├── bloodBank.service.ts# 500 BDT onboarding & 5 BDT outreach fee
│   │   │   │   ├── bloodBank.controller.ts
│   │   │   │   └── bloodBank.router.ts # /api/blood-banks
│   │   │   ├── report/
│   │   │   │   ├── report.service.ts   # Automated Two-Strike ban policy
│   │   │   │   ├── report.controller.ts
│   │   │   │   └── report.router.ts    # /api/reports
│   │   │   ├── review/
│   │   │   │   ├── review.service.ts   # Verified review submission
│   │   │   │   ├── review.controller.ts
│   │   │   │   └── review.router.ts    # /api/reviews
│   │   │   └── index.ts                # Master router mounting all modules under /api
│   │   │
│   │   ├── middlewares/                # Shared middlewares (auth, errorHandler, validate)
│   │   ├── socket/                     # Real-time WebSocket rooms & dispatch events
│   │   ├── app.ts                      # Express app factory (used by Supertest)
│   │   └── server.ts                   # HTTP listener, Socket.io attachment, graceful shutdown
│   │
│   ├── prisma/
│   │   └── schema.prisma               # PostgreSQL models & relations
│   └── tests/
│       ├── unit/                       # Fast isolated unit tests (boundary testing)
│       └── integration/                # Supertest HTTP integration test suite
│
├── client/                             # Frontend Next.js 14 (App Router & Tailwind)
│   └── src/
│       ├── app/
│       │   ├── page.tsx                # Emergency dashboard & boundary test playground
│       │   ├── requests/new/           # Post blood request form
│       │   ├── blood-banks/            # Blood bank portal & 500 BDT deposit simulator
│       │   └── safety/                 # Two-strike ban simulator
│       └── lib/socket.ts               # Socket.io client connector
│
└── package.json                        # Root workspace manager
```

---

## 📡 Modular API Endpoints

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | System uptime, memory usage, environment |
| **Auth** | `POST` | `/api/auth/login` | Register or login with phone number |
| **Auth** | `GET` | `/api/auth/profile` | Retrieve profile and active chats |
| **Request** | `POST` | `/api/requests` | Post request & notify donors within 20km |
| **Request** | `GET` | `/api/requests/nearby` | Filter active requests within 20km radius |
| **Request** | `GET` | `/api/requests/:id` | Request details and donor chat sessions |
| **Request** | `PATCH`| `/api/requests/:id/complete` | Mark request as `COMPLETED` |
| **Donor** | `POST` | `/api/donors/schedule` | Donor sets appointment time schedule |
| **Donor** | `PATCH`| `/api/donors/availability` | Toggle donor availability |
| **Chat** | `GET` | `/api/chats/:sessionId` | Retrieve chat message history |
| **Chat** | `POST` | `/api/chats/:sessionId/messages` | Send message (strictly enforces **1-message** rule) |
| **Blood Bank** | `GET` | `/api/blood-banks` | List all verified blood banks |
| **Blood Bank** | `POST` | `/api/blood-banks/register` | Register blood bank (validates **&ge; 500 BDT** deposit) |
| **Blood Bank** | `GET` | `/api/blood-banks/:bloodBankId` | View blood bank ledger transactions |
| **Blood Bank** | `POST` | `/api/blood-banks/:bloodBankId/outreach` | Outreach to requester (deducts **5 BDT** fee) |
| **Report** | `POST` | `/api/reports` | Submit abuse report (triggers **2-strike** automated ban) |
| **Report** | `GET` | `/api/reports/:userId` | View abuse report history for user |
| **Review** | `POST` | `/api/reviews` | Submit verified review for blood bank |

---

## 🧪 Automated Testing Suite

All 26 automated unit and integration tests run across the refactored modular services:

```bash
# Run all tests:
npm run test

# Run unit tests only:
npm run test:unit

# Run integration tests only:
npm run test:integration
```
