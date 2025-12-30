
# Reservation PWA Architecture

## System Overview
This project is a Progressive Web App (PWA) designed to manage reservations and prevent no-shows using timed push notifications.

### 1. Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Database/Auth**: Supabase (PostgreSQL + Auth + Realtime)
- **PWA**: Serwist (Service Worker Framework)
- **Scheduling**: Upstash QStash (Serverless Job Scheduler)
- **Push Notifications**: Web Push (VAPID)

### 2. Architecture Diagram

```mermaid
graph TD
    User[Buyer (PWA)] -->|1. Book Appointment| NextJS[Next.js App]
    NextJS -->|2. Create Record| DB[(Supabase DB)]
    NextJS -->|3. Schedule Job (T-1h)| QStash[Upstash QStash]
    
    QStash -->|4. Trigger Webhook (T-1h)| API[Next.js API Route<br>/api/cron/reminder]
    API -->|5. Fetch Subscription| DB
    API -->|6. Send Push Payload| PushService[Web Push Service]
    PushService -->|7. Deliver Notification| User
    
    Seller[Seller Dashboard] -- Subscribe --> Realtime[Supabase Realtime]
    DB -- Update: Confirmed --> Realtime
    Realtime -->|8. Update UI| Seller
```

### 3. Folder Structure
```
/app
  /api
    /cron/reminder/route.ts  # Triggered by Upstash
    /push/send/route.ts      # (Optional) Manual send
  /dashboard
    page.tsx                 # Seller Dashboard (Realtime)
  /actions.ts                # Server Actions (Subscribe, Reserve)
  /sw.ts                     # Service Worker Entry (Serwist)
  layout.tsx                 # Root Layout
  page.tsx                   # Buyer Booking Page
/public
  /manifest.json             # PWA Manifest
  /sw.js                     # Generated SW (do not edit)
/utils
  /supabase
    client.ts
    server.ts
next.config.ts               # Serwist Plugin Config
tsconfig.json                # Added "webworker" lib
```

### 4. Key Logic Flows

#### A. Reservation & Scheduling
1. User calls `createReservation(date)` server action.
2. Server saves reservation to Supabase.
3. Server calculates `notificationTime = date - 1 hour`.
4. Server calls `qstash.publishJSON()` with `notBefore: notificationTime` pointing to `/api/cron/reminder`.

#### B. Push Notification
1. QStash hits `/api/cron/reminder`.
2. API verifies request.
3. API fetches user's `push_subscription` from `profiles` table.
4. API uses `web-push` to send notification.
5. Service Worker `sw.ts` receives 'push' event and shows system notification.

#### C. Realtime Status
1. `Dashboard` component subscribes to `reservations` table changes via Supabase `channel`.
2. When a reservation status changes (e.g. User confirms), UI updates instantly without refresh.
