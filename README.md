# Aurelia — Hotel Management System (MERN)

A full-stack MERN app for the "Aurelia" luxury hotel guest experience: browsing rooms,
making reservations, viewing booking history, and a guest loyalty profile — matching the
provided design, with all prices in **PKR (Pakistani Rupees)**.

Built against the LuxuryStay Hotel Management System requirements doc: guest accounts with
JWT auth, room inventory & availability, reservations with automatic overlap checking,
billing totals, and a role field on users (guest / receptionist / housekeeping / manager /
admin) so staff-side modules (admin dashboard, housekeeping, reporting) can be layered on
top of the same models later.

## Stack
- **MongoDB** + Mongoose
- **Express** REST API
- **React** (Vite) + plain hand-written CSS (see `client/src/index.css`)
- **Node.js**

## Project structure
```
hotel-mern/
  server/     Express API, MongoDB models, JWT auth
  client/     React frontend (Aurelia dark/gold theme)
```

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env     # then edit MONGO_URI / JWT_SECRET as needed
npm run seed              # seeds 6 rooms + a demo guest + 1 booking (PKR pricing)
npm run dev                # starts on http://localhost:5000
```

Demo logins after seeding:

| Role        | Email                     | Password       |
|-------------|---------------------------|----------------|
| Guest       | james.harlow@email.com    | password123    |
| Admin       | admin@aurelia.com         | admin123       |
| Manager     | manager@aurelia.com       | manager123     |
| Receptionist| reception@aurelia.com     | reception123   |
| Housekeeping| housekeeping@aurelia.com  | housekeeping123|

Log in with a staff account, then click **"Admin Console"** in the navbar (or go to
`/admin`) to reach the dashboard, room management, booking management, and staff/guest
management.

## 2. Frontend setup

```bash
cd client
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so just run both
servers side by side.

## API overview

| Method | Route                     | Description                             | Auth           |
|--------|----------------------------|------------------------------------------|----------------|
| POST   | /api/auth/register         | Create guest account                     | Public         |
| POST   | /api/auth/login             | Login, returns JWT                       | Public         |
| GET    | /api/rooms                  | List rooms (filter by type, sort, guests)| Public         |
| GET    | /api/rooms/:id               | Room details                             | Public         |
| POST   | /api/rooms                    | Create room                              | admin/manager  |
| PUT    | /api/rooms/:id                 | Update room                              | admin/manager  |
| PUT    | /api/rooms/:id/status            | Update housekeeping status               | staff          |
| POST   | /api/bookings                     | Create a reservation                     | Guest (auth)   |
| GET    | /api/bookings/my                    | Guest's own bookings + stats             | Guest (auth)   |
| PUT    | /api/bookings/:id                     | Modify booking dates                     | Guest (auth)   |
| PUT    | /api/bookings/:id/cancel                | Cancel a booking                         | Guest (auth)   |
| GET    | /api/bookings                             | All bookings                             | staff          |
| GET    | /api/users/me                               | Guest profile + loyalty status           | Guest (auth)   |
| PUT    | /api/users/me                                 | Edit profile                             | Guest (auth)   |
| GET    | /api/users                                     | List all users (optional ?role=)          | admin/manager  |
| PUT    | /api/users/:id/role                              | Change a user's role                     | admin          |
| PUT    | /api/users/:id/status                              | Activate/deactivate a user                | admin          |
| PUT    | /api/bookings/:id/admin-status                       | Override any booking's status             | staff          |
| GET    | /api/admin/dashboard                                   | Revenue, occupancy, booking stats         | admin/manager  |

## Admin panel (frontend)
Routes under `/admin` (guarded — only `admin`, `manager`, `receptionist` roles can enter):
- `/admin` — Dashboard: revenue, occupancy rate, bookings by status, revenue by room type, recent activity
- `/admin/rooms` — Add/edit/delete rooms, change room status (available/occupied/cleaning/maintenance)
- `/admin/bookings` — View & filter all bookings, override status, search by guest/room/code
- `/admin/staff` — View all users, promote/demote roles, activate/deactivate accounts

## Currency
All prices are stored and displayed in **PKR** (formatted as `Rs 61,600`). Room prices in
the seed data are proportional PKR conversions of the original design's USD prices.

## Notes / next steps
The functional requirements doc also calls for an admin dashboard, housekeeping task
management, invoicing/PDF receipts, and analytics reporting. The `role` field on `User`
and the `status` field on `Room` are already in place to support building those modules
on top of this same API.
