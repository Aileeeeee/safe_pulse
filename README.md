# SAFEPULSE — NGO Emergency Response Dashboard

A production-ready Next.js 15 frontend for the SAFEPULSE platform.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local .env.local
# Edit .env.local and set NEXT_PUBLIC_API_BASE_URL to your Django backend URL

# 3. Add your logo
# Copy logo-icon.png to /public/logo-icon.png

# 4. Run dev server
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, Signup pages
│   ├── (dashboard)/         # All authenticated pages
│   │   ├── dashboard/
│   │   ├── incidents/
│   │   │   └── [id]/        # Incident detail
│   │   ├── alerts/
│   │   ├── analytics/
│   │   ├── team/
│   │   ├── activity/
│   │   └── settings/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── auth/                # AuthShell (split-panel layout)
│   ├── layout/              # DashboardLayout, Topbar, Sidebar
│   └── ui/                  # StatCard, Badges, Skeleton, EmptyState
├── features/
│   ├── auth/                # LoginForm, SignupForm
│   └── incidents/           # LiveFeed, AlertsPanel, TopAreas
├── services/
│   ├── auth.service.ts      # All auth API calls
│   └── incidents.service.ts # All incident API calls
├── hooks/
│   └── index.ts             # All React Query hooks
├── store/
│   └── auth.store.ts        # Zustand auth store
├── lib/
│   └── api-client.ts        # Axios instance + interceptors
├── types/
│   └── index.ts             # All TypeScript types
├── utils/
│   └── index.ts             # cn(), formatters, color maps
├── constants/
│   └── index.ts             # API endpoints, query keys
├── providers/
│   └── query-provider.tsx   # TanStack Query setup
└── middleware.ts             # Auth guard (redirects)
```

---

## Backend Integration Guide

Your Django URL patterns map to these frontend service calls:

### Auth endpoints

| Django URL | Frontend service call |
|---|---|
| `POST /auth/signup/` | `authService.signup(payload)` |
| `POST /auth/login/` | `authService.login(payload)` |
| `POST /auth/logout/` | `authService.logout()` |
| `GET /auth/profile/` | `authService.getProfile()` |
| `POST /auth/refresh/` | Called automatically by Axios interceptor on 401 |

**Login response** — your Django view should return:
```json
{
  "user": {
    "id": 1,
    "email": "admin@ngo.ng",
    "first_name": "Admin",
    "last_name": "User",
    "role": "ngo_admin",
    "organisation": "SafeSpace Nigeria"
  },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  }
}
```

**Signup response:**
```json
{ "detail": "Account created. Check your email for the OTP." }
```

---

### Incident endpoints

| Django URL | Frontend service call |
|---|---|
| `GET /incidents/incidents/` | `incidentService.list(filters)` |
| `POST /incidents/incidents/submit/` | `incidentService.submit(formData)` |
| `GET /incidents/incidents/stats/` | `incidentService.stats()` |
| `POST /incidents/incidents/{id}/acknowledge/` | `incidentService.acknowledge(id)` |
| `GET /incidents/dashboard/` | `incidentService.dashboard()` |
| `GET /incidents/coordinator-dashboard/` | `incidentService.coordinatorDashboard()` |

**Stats response** (`/incidents/stats/`):
```json
{
  "new_reports": 13,
  "new_reports_delta": 5,
  "active_cases": 6,
  "active_cases_delta": 3,
  "escalated_cases": 3,
  "escalated_cases_delta": 0,
  "resolved_cases": 20,
  "resolved_cases_delta": 7
}
```

**Dashboard response** (`/incidents/dashboard/`):
```json
{
  "stats": { ...same as above... },
  "live_feed": [ ...array of Incident objects... ],
  "active_alerts": [
    {
      "id": 1,
      "type": "critical",
      "title": "High Risk Area",
      "description": "Multiple reports in Yaba",
      "area": "Yaba, Lagos",
      "count": 7,
      "created_at": "2026-05-30T10:00:00Z"
    }
  ],
  "top_areas": [
    { "name": "Surulere", "count": 20, "percentage": 100 },
    { "name": "Ojo",      "count": 15, "percentage": 75 }
  ]
}
```

**Incident object shape:**
```json
{
  "id": 2345,
  "ref": "#2345",
  "category": "domestic_violence",
  "category_display": "Domestic Violence",
  "severity": "critical",
  "status": "new",
  "area": "Oshodi",
  "latitude": 6.5568,
  "longitude": 3.3478,
  "reported_at": "2026-05-30T10:40:00Z",
  "source": "app",
  "anonymous": true,
  "description": "...",
  "timeline": [
    { "id": 1, "action": "Report received via App", "timestamp": "2026-05-30T10:40:00Z", "done": true },
    { "id": 2, "action": "Awaiting Acknowledge", "timestamp": "", "done": false }
  ],
  "nearby_support": [
    { "name": "Community Center", "distance": "0.8km", "type": "center" },
    { "name": "Women's Shelter",  "distance": "1.5km", "type": "shelter" },
    { "name": "Crisis Line (24/7)", "distance": "—",   "type": "hotline" }
  ]
}
```

---

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "init safepulse"
git remote add origin https://github.com/YOUR_USERNAME/safepulse.git
git push -u origin main

# 2. Go to vercel.com → New Project → Import from GitHub

# 3. Set environment variable in Vercel dashboard:
#    NEXT_PUBLIC_API_BASE_URL = https://your-django-backend.com

# 4. Deploy — Vercel auto-detects Next.js
```

### Django CORS setup (required for Vercel deployment)

In your Django `settings.py`:

```python
INSTALLED_APPS = [
    ...
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ← must be first
    ...
]

CORS_ALLOWED_ORIGINS = [
    "https://your-safepulse-app.vercel.app",
    "http://localhost:3000",  # for local dev
]

CORS_ALLOW_CREDENTIALS = True  # needed for cookie-based auth
```

---

## Real-time / Live Feed

The dashboard polls every 30 seconds automatically via TanStack Query's `refetchInterval`.

For true WebSocket real-time (optional upgrade), add Django Channels to your backend and create a WebSocket hook in `src/hooks/useWebSocket.ts` that invalidates the TanStack Query cache on each message.

---

## Adding a New Page

1. Create `src/app/(dashboard)/your-page/page.tsx`
2. Add to the nav array in `src/components/layout/DashboardLayout.tsx`
3. Add a service method in `src/services/` if it needs a new endpoint
4. Add a hook in `src/hooks/index.ts`
5. Add the endpoint constant in `src/constants/index.ts`
