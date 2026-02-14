# RidePrompt – Smart Cab Assistant

A mobile + web product that reduces friction when users receive Google Maps links and want to open a cab app with pre-filled destination.

> **Critical rule:** RidePrompt never auto-books and never force-redirects. The user must always confirm and choose a provider first.

## SECTION 1 – Product Architecture

### Monorepo layout

- `apps/web` – React + Vite + TypeScript + Tailwind PWA app
- `apps/mobile` – Expo React Native app (Android + iOS)
- `packages/shared` – shared URL parser + deep-link builder
- `services/api` – optional Express backend for history/analytics
- `extensions/browser` – optional Chrome extension

### Primary flow (all platforms)

1. Receive Google Maps URL
2. Parse/validate URL and extract `lat`, `lng`, `label`, `address`
3. Show confirmation prompt card/modal
4. User explicitly chooses one action
5. Open selected provider deep link in browser/native app

No action is triggered before user confirmation.

## SECTION 2 – Mobile App Implementation

See `apps/mobile/App.tsx` and `apps/mobile/src/shareHandler.ts`.

- Uses `Linking` listener for inbound links.
- Supports manual paste and share-extension payload handling.
- Parses and validates Google Maps URLs.
- Shows confirmation card and provider action buttons.
- Opens provider deep links **only** on button click.

## SECTION 3 – Web App Implementation

See `apps/web/src/App.tsx`.

- Mobile-first card UI.
- Detects pasted Google Maps URL or `?shared=` query param.
- Extracts location metadata and renders a confirmation modal.
- Provider buttons: Uber, Ola, Google Maps, Cancel.
- Offline banner with fallback behavior.

## SECTION 4 – Deep Linking Logic

See `packages/shared/src/deeplinks.ts`.

- `buildUberDeepLink`:
  `https://m.uber.com/ul/?action=setPickup&dropoff[latitude]=LAT&dropoff[longitude]=LNG&dropoff[nickname]=NAME`
- `buildOlaDeepLink` (app/web fallback pattern)
- `buildGoogleMapsDeepLink`

All are generated dynamically from parsed coordinates.

## SECTION 5 – Optional Backend

See `services/api/src/server.ts`.

- Express API endpoints:
  - `POST /history` – stores lightweight user-approved history events
  - `GET /history` – fetches recent entries
  - `POST /analytics/event` – aggregates UI usage events
- Includes consent flag (`locationConsent`) and retention-oriented shape.

## SECTION 6 – Browser Extension (Optional)

See `extensions/browser`.

- Content script detects Google Maps URLs on page.
- Shows floating “Open in RidePrompt” button.
- On click, opens web app with encoded shared URL.

## SECTION 7 – Deployment Instructions

### Web (Vercel/Netlify)

```bash
cd apps/web
npm install
npm run build
npm run preview
```

Deploy `dist/` output.

### Mobile (Expo)

```bash
cd apps/mobile
npm install
npm run start
```

Build with EAS for iOS/Android.

### API (Railway/Render/Fly)

```bash
cd services/api
npm install
npm run build
npm run start
```

Use HTTPS + managed DB + TTL retention policy.
