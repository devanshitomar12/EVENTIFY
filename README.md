# Eventify — Modern Event Discovery, Management & Ticket Booking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stack](https://img.shields.io/badge/Stack-MERN-6366F1.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-10B981.svg)](https://github.com)

**Eventify** is a production-quality full-stack MERN application crafted with modern SaaS design aesthetics. It provides an end-to-end platform for discovering premier events, reserving multi-tier tickets with atomic race-condition prevention, instant cryptographic QR code ticket generation, and rich analytical portals for Event Organizers and Platform Administrators.

---

## 🌟 Highlights & Key Features

### 🎨 Visual & UX Excellence
- **SaaS / Startup Aesthetic**: Dark mode design featuring glassmorphism (`backdrop-filter`), custom scrollbars, subtle ambient glows, and clean typography with Google Fonts (*Plus Jakarta Sans*).
- **Responsive Layout**: Fluid navigation drawer on mobile, responsive grid layouts, and polished sticky widgets.
- **Zero Placeholder Dependencies**: Real-world seed events with high-resolution imagery, descriptive copy, and multi-tier pricing.
- **Celebratory Confetti & Micro-Interactions**: Instant visual confirmation upon booking with downloadable, print-ready boarding-pass digital tickets.

### 🛡️ Enterprise Security & Robust Backend
- **Role-Based Access Control (RBAC)**: Enforced across all endpoints and client routes for `USER`, `ORGANIZER`, and `ADMIN`.
- **Atomic Concurrency Protection**: High-demand ticket bookings utilize MongoDB `$inc` with atomic conditional validation (`$expr: { $lte: [...] }`), strictly preventing overselling or negative inventory under concurrent traffic.
- **Zero-Config Local Development**: Transparent automatic fallback to `MongoMemoryServer` if a native MongoDB daemon or Atlas URI is not detected, allowing immediate review without manual database setup.
- **Cryptographic QR Codes**: Each ticket is embedded with a high-resolution QR pass encoding attendee verification, booking reference, and event hash.
- **Client & Server PDF Export**: One-click PDF generation using `html2canvas` and `jsPDF`.
- **Nodemailer Operational Dispatch**: Automated booking confirmation and cancellation receipts with professional dark-theme HTML email templates.
- **Security Hardening**: `helmet`, CORS origin validation, express rate limiting on authentication routes, and Zod payload schema validation.

---

## 🏗️ Architecture & Project Structure

```
Eventify/
├── backend/
│   ├── src/
│   │   ├── config/             # DB, Cloudinary & Nodemailer configs
│   │   │   ├── db.js
│   │   │   ├── cloudinary.js
│   │   │   └── mailer.js
│   │   ├── controllers/        # Business logic controllers
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   ├── bookingController.js
│   │   │   ├── organizerController.js
│   │   │   └── adminController.js
│   │   ├── middleware/         # Security, JWT, RBAC & error handlers
│   │   │   ├── authMiddleware.js
│   │   │   ├── rbacMiddleware.js
│   │   │   ├── uploadMiddleware.js
│   │   │   ├── validateMiddleware.js
│   │   │   ├── rateLimitMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/             # Mongoose schemas & indexes
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   └── Booking.js
│   │   ├── routes/             # REST API endpoint definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── organizerRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── services/           # QR code generation & Email dispatch
│   │   │   ├── qrService.js
│   │   │   └── emailService.js
│   │   ├── utils/              # ID generation, ApiResponse formatters & loggers
│   │   │   ├── generateId.js
│   │   │   ├── apiResponse.js
│   │   │   └── logger.js
│   │   ├── validators/         # Zod schemas for input validation
│   │   │   ├── authValidator.js
│   │   │   ├── eventValidator.js
│   │   │   └── bookingValidator.js
│   │   ├── app.js              # Express app setup
│   │   ├── server.js           # Server entry point
│   │   └── seed.js             # Realistic dataset seed script
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── TicketCheckoutModal.jsx
│   │   │   ├── BookingSuccessModal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   ├── context/            # React Context API global state
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/              # Views & Dashboards
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── DigitalTicket.jsx
│   │   │   ├── OrganizerDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   └── api.js          # Axios client with JWT interceptor
│   │   ├── index.css           # Tailwind directives & design tokens
│   │   ├── App.jsx             # Router definition
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── package.json                # Root monorepo dev orchestrator
└── README.md
```

---

## 👥 User Roles & Permissions Matrix

| Feature / Resource | Attendee (`USER`) | Organizer (`ORGANIZER`) | Superadmin (`ADMIN`) |
| :--- | :---: | :---: | :---: |
| Browse & Search Events | ✅ | ✅ | ✅ |
| Filter by Category, City, Price, Date | ✅ | ✅ | ✅ |
| Book Multi-Tier Tickets | ✅ | ✅ | ✅ |
| View & Download Digital QR Pass | ✅ | ✅ | ✅ |
| Cancel Eligible Bookings | ✅ | ✅ | ✅ |
| Create, Edit & Delete Own Events | ❌ | ✅ | ✅ |
| Upload Event Banner (Cloudinary) | ❌ | ✅ | ✅ |
| View Organizer Revenue & Ticket Charts | ❌ | ✅ | ✅ |
| Search & Export Attendee Roster | ❌ | ✅ | ✅ |
| Moderate Events (Approve / Reject) | ❌ | ❌ | ✅ |
| Delete Any Inappropriate Event | ❌ | ❌ | ✅ |
| Manage User Roles (`USER` ↔ `ORGANIZER` ↔ `ADMIN`) | ❌ | ❌ | ✅ |
| Suspend or Reactivate Accounts | ❌ | ❌ | ✅ |
| View Platform-Wide Financials & Growth | ❌ | ❌ | ✅ |

---

## ⚡ Quick Start & Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/eventify.git
cd Eventify

# Install root, backend, and frontend packages in one command
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` in `backend/`:
```bash
cp backend/.env.example backend/.env
```
Default values work immediately out of the box.

### 3. Run Development Server
```bash
# From the root directory:
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5001`
- **API Health**: `http://localhost:5001/api/health`

*(The database auto-seeds on first boot if empty, or you can re-seed anytime with `npm run seed`).*

---

## 🔑 Demo Reviewer Credentials

The login page includes **one-click autofill buttons** for rapid evaluation:

| Role | Email | Password |
| :--- | :--- | :--- |
| **👑 Admin** | `admin@eventify.com` | `Admin@123` |
| **🎪 Organizer** | `organizer@eventify.com` | `Organizer@123` |
| **🎟️ Attendee** | `user@eventify.com` | `User@123` |

---

## 🔌 API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user (`USER` or `ORGANIZER`)
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/logout` — Revoke session
- `GET  /api/auth/me` — Retrieve currently authenticated user profile
- `PUT  /api/auth/profile` — Update name, phone, or avatar
- `PUT  /api/auth/change-password` — Verify current password and update
- `POST /api/auth/forgot-password` — Generate reset token and email link
- `POST /api/auth/reset-password/:token` — Set new password using token

### Events (`/api/events`)
- `GET    /api/events` — Query events with filters (`search`, `category`, `city`, `sort`, `page`, `limit`)
- `GET    /api/events/:id` — Retrieve full event details and remaining tier capacity
- `GET    /api/events/:id/related` — Retrieve 3 related category events
- `POST   /api/events` — Create event (*Organizer/Admin*)
- `PUT    /api/events/:id` — Update event (*Owner/Admin*)
- `DELETE /api/events/:id` — Remove event (*Owner/Admin*)
- `POST   /api/events/upload-banner` — Upload image to Cloudinary / Data URI

### Bookings (`/api/bookings`)
- `POST  /api/bookings` — Atomically book tickets and generate QR pass
- `GET   /api/bookings/my` — Retrieve user's personal booking wallet
- `GET   /api/bookings/:id` — Retrieve digital ticket pass data
- `PATCH /api/bookings/:id/cancel` — Cancel reservation and restock inventory

### Organizer Portal (`/api/organizer`)
- `GET /api/organizer/events` — Retrieve organizer's events with revenue breakdown
- `GET /api/organizer/analytics` — Fetch KPI summaries and Recharts data series
- `GET /api/organizer/bookings` — Fetch full attendee roster and ticket details

### Superadmin Console (`/api/admin`)
- `GET   /api/admin/analytics` — Platform gross revenue, bookings, and category charts
- `GET   /api/admin/events` — All platform events (including pending moderation)
- `PATCH /api/admin/events/:id/approve` — Approve pending event
- `PATCH /api/admin/events/:id/reject` — Reject inappropriate event
- `DELETE /api/admin/events/:id` — Remove event
- `GET   /api/admin/users` — List platform users with search and role filters
- `PATCH /api/admin/users/:id/role` — Update user role (`USER`, `ORGANIZER`, `ADMIN`)
- `PATCH /api/admin/users/:id/status` — Toggle status (`ACTIVE`, `SUSPENDED`)

---

## 💾 Database Schema Design

### User Model
- `name` (String, required)
- `email` (String, required, unique, indexed)
- `password` (String, select: false, bcrypt hashed)
- `role` (Enum: `USER`, `ORGANIZER`, `ADMIN`, default: `USER`)
- `profileImage` (String)
- `phone` (String)
- `status` (Enum: `ACTIVE`, `SUSPENDED`)
- `resetPasswordToken` & `resetPasswordExpire`

### Event Model
- `title` (String, required, full-text indexed)
- `description` (String, required)
- `category` (Enum: `Technology`, `Music`, `Sports`, `Business`, `Education`, `Entertainment`, `Workshops`, `Conferences`, indexed)
- `image` (String, banner URL)
- `date` (Date, indexed)
- `startTime` & `endTime` (String)
- `venue`, `address`, `city` (String, indexed)
- `organizer` (ObjectId ref: `User`, indexed)
- `ticketTypes` (`[ { name, price, quantity, sold, description } ]`)
- `status` (Enum: `APPROVED`, `PENDING`, `REJECTED`, indexed)
- `rules` (`[ String ]`)
- `featured` (Boolean)

### Booking Model
- `bookingId` (String, unique, format: `EVT-YYYY-XXXXXX`)
- `user` (ObjectId ref: `User`, indexed)
- `event` (ObjectId ref: `Event`, indexed)
- `tickets` (`[ { ticketType, price, quantity } ]`)
- `totalAmount` (Number)
- `status` (Enum: `Confirmed`, `Cancelled`, `Completed`, indexed)
- `qrCode` (String data URI)
- `attendeeDetails` (`{ name, email, phone }`)
- `cancellationReason` & `cancelledAt`

---

## 🚀 Production Deployment Guide

### Deploying Frontend to Vercel
1. Set the root directory to `frontend` in your Vercel project configuration.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment variable:
   - `VITE_API_URL`: Your deployed backend production URL (e.g. `https://eventify-api.onrender.com/api`)

### Deploying Backend to Render / Railway
1. Set the root directory to `backend`.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Environment variables:
   - `PORT`: `5001`
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: Your deployed Vercel frontend URL
   - `MONGO_URI`: Your MongoDB Atlas cluster connection string
   - `JWT_SECRET`: A secure 64-character random string
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`

---

## 🔮 Roadmap & Future Enhancements
- [ ] Stripe / LemonSqueezy payment intent webhooks for real credit card processing
- [ ] Apple Wallet (`.pkpass`) binary generation
- [ ] Live seat-map interactive SVG seating selector
- [ ] Webhook alerts for organizers on sold-out events

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
