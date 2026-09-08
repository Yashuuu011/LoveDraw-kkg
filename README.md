# ❤️ LoveDraw — Educational Full-Stack Romantic Web Application

> 🎓 **Educational & Portfolio Project Notice**: LoveDraw is built strictly for educational learning, demonstration, and web development portfolio purposes. All draws, entries, and QR scans are 100% free mock simulations. No real money or actual financial transactions take place.

LoveDraw is a romantic community web platform combining daily love note reminders in an interactive 3D animated envelope, weekly and monthly couple prize draws, a safe demo payment gateway, photo memories gallery, and a cinematic winner reveal experience.

---

## 🌟 Key Features

1. **Daily Love Message System (`/daily-love`)**
   - Interactive 3D opening envelope with heart confetti burst animation.
   - Non-repeating date algorithm backed by **365 unique seeded romantic quotes** across 12 categories (*Good morning, Good night, Cute, Romantic, Long-distance, Missing you, Appreciation, Anniversary, Motivation, Soulmate, Funny, Deep love*).
   - Category filtering, favorite bookmarking, and copy/share actions.

2. **Weekly & Monthly Draw System (`/draws` & `/draw/:id`)**
   - Active and upcoming draws featuring luxury photo sessions, stargazing hampers, and couple dining experiences.
   - Dynamic flip-card countdown timer.
   - **Mock/Demo QR Gateway**: Generates unique reference codes (`LD-YYYY-MM-XXXXXX`) with dynamic QR generation and simulated payment authorization (`PAYMENT_MODE=demo`).

3. **Cinematic Winner Reveal (`/draw/:id/winner`)**
   - Darkened screen backdrop, floating heart swell, slot machine/spinner draw animation, and confetti explosion (`canvas-confetti`).

4. **Couple Memories Photo Gallery (`/memories`)**
   - Glassmorphic card grid with image hover zoom, glowing effects, and fullscreen lightbox modal preview.

5. **User Authentication & Profile (`/profile`, `/login`, `/register`)**
   - Secure JWT token authentication & bcrypt password hashing.
   - Personal profile tracking draw participation history, saved favorite love notes, and winnings.

6. **Admin Dashboard & Fair Draw Engine (`/admin`)**
   - Admin authentication with statistical overview.
   - Server-side cryptographically secure random winner draw selection (`crypto.randomInt`), duplicate winner prevention, and audit logging.
   - Full CRUD for draws and daily message quotes.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS (custom romantic palette: deep burgundy, rose pink, soft blush, cream, dark purple, subtle gold accents), Framer Motion, Lucide React icons, Canvas-Confetti, QRCode React, Axios, React Hook Form, Zod.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM (SQLite/PostgreSQL compatible), JWT, bcryptjs, Helmet, CORS, dotenv.

---

## 🚀 Quick Setup Instructions

### 1. Install Dependencies
In the root directory, install all monorepo dependencies:
```bash
npm run install:all
```
*(Or navigate to both `server/` and `client/` and run `npm install` inside each).*

### 2. Setup Database & Seed 365 Daily Messages
Navigate to the `server/` folder and run Prisma migrations and database seeder:
```bash
cd server
npx prisma db push
npm run seed
```

This populates:
- **365+ unique romantic daily messages**
- Demo user accounts
- Sample active & completed draws
- Sample couple memories
- Admin account (`admin@lovedraw.com` / `admin123`)

### 3. Run Development Server
From the root directory, start both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API Server**: `http://localhost:5000`

---

## 🔐 Credentials for Demo Testing

- **Demo Admin Portal**: `http://localhost:5173/admin`
  - **Email**: `admin@lovedraw.com`
  - **Password**: `admin123`
- **Demo User Account**:
  - **Email**: `user@lovedraw.com`
  - **Password**: `user123`

---

## 🛡️ Legal & Money Safety Notice

This application is strictly configured with `PAYMENT_MODE=demo` by default. No real money or payment credentials (card numbers, CVV, UPI PINs) are processed or stored. The architecture isolates payment handling behind a service interface for legal compliance in authorized jurisdictions.
