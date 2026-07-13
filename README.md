# E-Com Platform (Next.js + MongoDB)

Production-style multi-role e-commerce system built with Next.js App Router, MongoDB (Mongoose), and NextAuth credentials auth.

This README explains how the complete system works, how roles and APIs are connected, and how to run/maintain it.

---

## 1) System Overview

This project includes:

- **Public storefront** (product browsing, search, category filtering, product details)
- **Customer flow** (register/login, cart, checkout, order history, order detail, order cancel)
- **Outlet management** (multi-outlet product management and order tracking)
- **Admin flow** (dashboard + management for products, categories, users, employees, outlets, news, orders)
- **Employee sub-roles** with permission-based access to specific admin modules
- **Content and communications** (news module, contact endpoint, webhook-based notifications)

---

## 2) Tech Stack

- **Frontend:** Next.js 16 App Router, React 19, Tailwind CSS 4
- **Backend:** Next.js Route Handlers under `app/api`
- **Database:** MongoDB with Mongoose
- **Auth:** NextAuth Credentials provider with JWT sessions
- **State (client):** Zustand (`store/useCart.ts`) + SWR in places
- **Media:** Cloudinary uploads via server API
- **Testing/Linting:** ESLint, TypeScript checks, Playwright config
- **Containerization:** Dockerfile multi-stage + docker-compose

---

## 3) Role & Permission Model

### Roles

- `user` — customer account
- `admin` — full system access
- `employee` — staff account with granular permissions
- `outlet-admin` — outlet management access

### Employee permission sets

Default permission groups are defined in `lib/permissions.ts`:

- `accountant` → order management and reporting
- `product_manager` → products/categories management
- `reporter` → news management

Middleware and API-level checks enforce access:

- `middleware.ts` protects user/distributor/admin/employee areas
- Admin APIs map endpoints to required permissions (`permissionForAdminApi`)
- Final endpoint checks use `hasPermission(...)`

---

## 4) High-Level Architecture

### Request path

1. Browser requests page/API
2. `middleware.ts` checks route class and token
3. Auth/session resolved via NextAuth JWT (`lib/auth.ts`)
4. API/page handler runs business logic
5. Mongoose models persist/read data
6. Optional webhook notifications fire on specific events

### Auth internals

- Credentials auth supports:
	- env-based admin login (`ADMIN_EMAIL` + `ADMIN_PASSWORD`)
	- DB users (`models/User`)
	- DB employees (`models/Employee`)
- Session strategy: JWT
- Session token stores role + permissions for authorization decisions

---

## 5) Core Business Workflows

### A) Customer shopping & ordering

1. Browse products (`/shop`, `/api/products`)
2. Add/update cart (`/api/cart`)
3. Checkout (`/checkout` + `/api/orders`)
4. Order creation:
	 - validates stock
	 - atomically decrements stock
	 - stores item snapshot (name/price/qty)
	 - records shipping + payment method (currently COD enforced)
5. Cart is cleared after normal checkout
6. Customer tracks orders via `/my-orders` and `/api/orders`, `/api/orders/[id]`

### B) Distributor onboarding & store ops

1. Distributor applies (`/register/distributor`, `/api/distributors/register`)
2. Account created as inactive distributor + pending distributor profile
3. Admin/authorized employee approves or rejects (`/api/admin/distributors/[id]`)
4. On approval, user becomes active distributor
5. Distributor manages own products (`/api/distributor/products*`)
6. Distributor views order slices containing their items (`/api/distributor/orders`)
7. Distributor can submit revenue payout requests (`/api/distributor/payment-requests`)

### C) Payment request cycle

1. Distributor requests payout amount
2. Backend computes unrealized revenue from delivered order items - approved payouts
3. Request blocked if amount exceeds unrealized revenue
4. Admin/accounting permissions review + approve/reject (`/api/admin/payment-requests*`)

### D) Order status updates & notifications

- Admin updates order/payment status (`PATCH /api/orders/[id]`)
- Notification helper can send webhook payload (`ORDER_STATUS_WEBHOOK`)
- Email notification hook is placeholder/log-driven unless integrated with provider

---

## 6) Data Model Summary

Main collections in `models/`:

- **User**: account identity, role, active state (password hashed on save)
- **Employee**: staff login, role label, explicit permission list
- **Distributor**: store profile + approval lifecycle status
- **Product**: catalog item, price/stock, optional distributor owner
- **Category**: category name/slug + product references
- **Cart**: one cart per user, line items
- **Order**: user, item snapshots, totals, shipping, payment/order statuses
- **PaymentRequest**: distributor payout request with approval status
- **News**: article content and publish state

---

## 7) API Surface (Grouped)

### Auth & Registration

- `POST /api/auth/register`
- `GET/POST /api/auth/[...nextauth]`
- `POST /api/distributors/register`

### Customer

- `GET/POST/DELETE /api/cart`
- `GET/POST /api/orders`
- `GET/PATCH /api/orders/[id]`
- `POST /api/orders/[id]/cancel`

### Public catalog/content

- `GET /api/products`, `GET /api/products/[id]`
- `GET /api/categories`
- `POST /api/contact`

### Admin/Employee managed

- `/api/admin/products*`
- `/api/admin/categories*`
- `/api/admin/distributors*`
- `/api/admin/payment-requests*`
- `/api/admin/users*`
- `/api/admin/employees*`
- `/api/admin/news*`
- `/api/admin/upload`

### Distributor-scoped

- `/api/distributor/products*`
- `/api/distributor/orders`
- `/api/distributor/payment-requests`

---

## 8) Project Structure (Important Paths)

- `app/` → pages + route handlers
- `app/api/` → backend HTTP endpoints
- `app/admin/` → admin UI
- `app/store/` → distributor UI
- `lib/` → auth, DB connection, permissions, cloudinary, helpers
- `models/` → mongoose schemas
- `scripts/` → seed/reset/auth utility scripts
- `components/` → shared UI and client components
- `middleware.ts` → route protection and authorization gateway

---

## 9) Environment Variables

Create `.env.local` in project root.

### Required (minimum)

```env
MONGODB_URI=mongodb://localhost:27017/ecom
NEXTAUTH_SECRET=change-me-long-random-string
NEXTAUTH_URL=http://localhost:3000
```

### Admin login (recommended)

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-admin-password
```

### Optional integrations

```env
# Cloudinary (required only for image upload endpoints)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Webhooks
CONTACT_WEBHOOK=
ORDER_STATUS_WEBHOOK=

# Notification sender identity (placeholder email flow)
NOTIFICATIONS_EMAIL_FROM=no-reply@example.com

# Seed helpers
SEED_ADMIN_EMAIL=user@example.com
SEED_ADMIN_PASSWORD=password123

# Reset-password script
RESET_EMAIL=
RESET_PASSWORD=
```

---

## 10) Local Development

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Open: `http://localhost:3000`

### Useful commands

```bash
npm run lint
npm run type-check
npm run build
npm run start
npm run seed
```

---

## 11) Docker Development

The repo contains:

- `Dockerfile` with `dev`, `builder`, and `runner` stages
- `docker-compose.yml` for local containerized dev

Run:

```bash
docker compose up --build
```

The compose setup mounts source code for live development and exposes port `3000`.

---

## 12) Maintenance Scripts

Located in `scripts/`:

- `seed.js` — seeds demo user/products/categories
- `reset-password.js` — reset a user password via env or CLI args
- `check-auth.js` — inspect auth-related user info in DB

Examples:

```bash
node scripts/seed.js
node scripts/reset-password.js user@example.com NewStrongPass123
node scripts/check-auth.js user@example.com
```

---

## 13) Operational Notes

- **No .env checked into repo**: you must create `.env.local` manually.
- **Cloudinary warnings are non-fatal in dev** unless you use upload APIs.
- **Admin pages are accessible to render fallback UI**, while admin APIs are strictly guarded.
- **Order stock reservation includes rollback** on order creation failures.
- **Contact and webhook notifications are best-effort** and won’t block user responses.

---

## 14) Troubleshooting

### "Please define the MONGODB_URI..."

- Ensure `.env.local` exists and includes `MONGODB_URI`
- Restart dev server after env changes

### Login succeeds/fails unexpectedly

- Check if account is inactive (`isActive: false`), common for unapproved distributors
- Confirm admin env credentials if using env-admin login

### 401/403/404 from admin endpoints

- Verify session role/permissions
- Employee accounts need matching permission keys for each endpoint group

### Upload endpoint fails

- Set Cloudinary env vars
- Send multipart `file` or JSON `dataUrl`

---

## 15) Security & Production Hardening Checklist

- Add rate limiting on auth/register/contact/order endpoints
- Add structured audit logs for admin mutations
- Add CSRF hardening for non-NextAuth mutation paths if needed
- Replace placeholder email notification with real transactional service
- Add e2e tests (Playwright is configured but no test specs are included)

---

## 16) Quick Start (Fastest Path)

1. Configure `.env.local` with MongoDB + NextAuth values
2. `npm install`
3. `npm run seed`
4. `npm run dev`
5. Open `http://localhost:3000`
6. Register a customer or login as admin (if admin env values are set)

---

If you want, the next step can be adding a `.env.example` file and API docs (`OpenAPI`/`Swagger`) so onboarding is even faster.
#   H i m a l a y a _ w e b s i t e  
 