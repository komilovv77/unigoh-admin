# UniGoh — Admin Panel

Admin panel for [UniGoh](https://unigoh.study), a Common App–style admissions platform for private universities in Uzbekistan. Main app and database schema: [komilovv77/unigoh](https://github.com/komilovv77/unigoh).

## Two roles, one panel

| Role | Sees |
| --- | --- |
| Platform admin | Everything: universities, students, applications, grants, finance, SMS log, staff |
| University staff | Only their own university: dashboard, applicants, applications, agreements |

Access is enforced by Row Level Security in Postgres, not just hidden in the UI. Both roles must use two-factor authentication (TOTP).

## Features

- Dashboard with application funnel and per-university stats
- Application drawer: profile, private documents (signed URLs), status changes allowed by role, exam dates, notes, contract amount
- Student directory with search; contact details masked until the student consents
- University management: catalog data in two languages, programs and tuition, staff access
- Grant competition: review queue, scoring, automatic allocation, one-click publication of results
- Finance ledger: commissions, grant payables, reconciliation export (CSV)
- Staff management with invites and MFA reset; SMS delivery log with retry

## Tech stack

React 18, Vite, Tailwind CSS 4, lucide-react, Supabase JS (Auth with MFA, Postgres, Storage), deployed on Vercel.

## Setup

Uses the same Supabase project as the main site. Environment variables (Vercel → Settings → Environment Variables):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

```bash
npm install
npm run dev
```

## Author

Built by [Abdulloh Komilov](https://github.com/komilovv77).
