# GEORISE Demo Script (Citizen + Agency + Admin)

## Preconditions
- Run migrations: `cd backend && npm run migrate`
- Seeds: `cd backend && npm run seed` (creates admin@example.com/admin123, staff@example.com/staff123, demo citizens/incidents)
- Start services (compose or local dev); ensure AI service is up.

## Citizen Flow
1) Register/login as citizen (or use seeded verified citizen).
2) Verify ID (mock OTP shown in response for new users).
3) Report incident with description + lat/lng.
4) Open "My Reports" → select incident → view AI classification (category, severity, confidence, model version) and status history.

## Agency Flow
1) Login as seeded agency staff.
2) `/agency/incidents` → open incident.
3) Actions: Verify → Assign → Mark Responding → Mark Resolved. Observe status history and GIS map marker.
4) Apply map filters (status/category) and toggle heatmap/cluster on dashboard.

## Admin Flow
1) Login as admin.
2) `/admin/summary` for counts.
3) `/admin/users` to update verification status; `/admin/agencies` to edit agency details.
4) `/admin/verification` to approve/reject pending requests and view history; view recent status changes and AI reclass log on dashboard.
