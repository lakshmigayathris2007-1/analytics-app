# Insight Board: Business Analytics Dashboard and Report Management

React + Redux Toolkit + Material UI + Recharts on the front end, Node/Express + MongoDB (Mongoose) on the back end.

## Requirements
- Node.js 18+
- MongoDB running locally (`docker compose up -d` starts one), or a MongoDB Atlas URI

## Run it
```bash
# 1. API
cd server
npm install
# edit .env if your MongoDB URI differs (a default .env is included; change JWT_SECRET)
npm run seed        # optional: demo users + 2,000 sales rows
npm run dev         # http://localhost:5000

# 2. Web app (new terminal)
cd client
npm install
npm run dev         # http://localhost:5173
```

## Demo logins (after `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Admin@123 |
| Analyst | analyst@example.com | Analyst@123 |
| Viewer | viewer@example.com | Viewer@123 |

Without seeding, the first account you register becomes the admin.

## Features
- **Auth**: register/login, bcrypt + JWT (1 day), role-based access (admin, analyst, viewer)
- **Dashboard**: KPI cards, line/bar/pie charts, filters by dataset, date range, region, category (Redux state drives refetch)
- **Import**: CSV/Excel upload, row validation, error summary, dataset delete. Columns: `date, revenue` required; `product, category, region, quantity, cost` optional. See `server/sample-data.csv`
- **Reports**: snapshot of the current dashboard filters, download as PDF or Excel
- **Users** (admin): change role, activate/deactivate, delete

## API
| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Dashboard | `GET /api/dashboard` (kpis, trend, byCategory, byRegion; query: dataset, from, to, region, category), `GET /api/dashboard/options` |
| Import | `GET /api/import/datasets`, `POST /api/import` (multipart `file`, `name`), `DELETE /api/import/:id` |
| Reports | `GET/POST /api/reports`, `GET /api/reports/:id/download?format=pdf\|xlsx`, `DELETE /api/reports/:id` |
| Users (admin) | `GET /api/users`, `PATCH /api/users/:id/role`, `PATCH /api/users/:id/status`, `DELETE /api/users/:id` |

## Production notes
Set a strong `JWT_SECRET`, set `CLIENT_URL` to your deployed front-end origin, and build the client with `npm run build` (set the API base URL/proxy accordingly).
