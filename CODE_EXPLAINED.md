# Sanjivani — Full Code Explanation for Developers

A single-file walkthrough of **every source file** in the project, written for
anyone who is new to the code (including future-you). Read it top-to-bottom
once; after that, jump to the section you need.

---

## 1. What is this project?

**Sanjivani** is a hospital bed-availability web app. It has two halves:

1. **A marketing / landing experience** (`start.html`, `home.html`, `about.html`,
   `features.html`, `contact.html`) — pretty pages with a navbar, an animated
   canvas globe, an FAQ, and a contact form.
2. **The real application** (`index.html` + `app.js` + `data.js`) — a GPS-based
   tool that:
   - asks the browser for the user's location,
   - fetches real nearby hospitals from **OpenStreetMap** (via Overpass and
     Nominatim public APIs),
   - renders them as cards with (simulated) ICU / General / Emergency bed
     counts,
   - lets the user type symptoms, sends them to **Google Gemini** for AI
     triage, and pre-filters hospitals by the suggested bed type.

A small **Node.js / Express backend** (`server.js`) does two things: it serves
the static HTML files on route paths (so URLs like `/home` work), and it
exposes one API route `POST /api/send-contact` that sends the contact form as
an email via **Nodemailer + Gmail SMTP**.

---

## 2. Project layout

```
Sanjevani/
├── server.js             Express server (static files + /api/send-contact)
├── package.json          npm metadata and dependencies
├── .env                  EMAIL_USER / EMAIL_PASSWORD (Gmail App Password)
├── start-backend.bat     Windows convenience script: npm install + npm start
│
├── start.html            Entry / welcome page (two cards: Explore / Search)
├── home.html             Landing page with animated globe + features preview
├── index.html            The actual app (search, AI, hospital list)
├── about.html            Static info page (mission, values, team)
├── features.html         Static info page (feature breakdown)
├── contact.html          Contact form + FAQ (hits backend SMTP)
├── pages-index.html      Developer-facing sitemap/navigation index
├── sitemap.html          User-facing sitemap
│
├── styles.css            Styles for index.html (the app)
├── home-styles.css       Styles for the landing experience
├── pages-styles.css      Shared styles for about/features/contact
│
├── app.js                Core app logic (filter, render, AI, modal)
├── data.js               GPS + OpenStreetMap fetching (loaded before app.js)
├── home-script.js        Navbar + modal + canvas globe for home.html
├── pages-script.js       Navbar + modal helpers for about/features/contact
│
├── FIX_SUMMARY.md        Historical fix notes (contact form)
├── README_PAGES.txt      Historical page-index notes
├── SMTP_SETUP_GUIDE.md   How to get a Gmail App Password
└── QUICK_START_PAGES.sh  Bash convenience script
```

---

## 3. How a request flows through the app

```
Browser → http://localhost:5000/
         │
         ▼
   Express `app.use(express.static(..., { index: false }))`
         │  (index:false means / is NOT auto-served as index.html)
         ▼
   `app.get('/')` → sends start.html
         │
         ▼


   User clicks "Search Hospitals" → /index.html
         │
         ▼
   index.html loads data.js then app.js
         │
         ├── data.js gets GPS, calls Overpass / Nominatim → fills HOSPITALS[]
         └── app.js renders cards, handles search, sends symptoms to Gemini
```

---

## 4. File-by-file walkthrough

### 4.1 `server.js` — the backend

Express app. Key points:

- **`app.use(cors({...}))`** — allows the frontend (when served from a
  different origin like VS Code Live Server on port 5500) to call
  `POST /api/send-contact`. Must be registered **before** routes.
- **`app.use(express.static(__dirname, { index: false }))`** — serves every
  file in the project folder as a static asset, but the `{ index: false }`
  option disables Express's default behavior of auto-serving `index.html` for
  `/`. Without this option, a request to `/` would return `index.html` and
  never reach our custom route. That's the bug we fixed: we want `/` to show
  `start.html`.
- **Page routes** — `/`, `/home`, `/index`, `/about`, `/features`, `/contact`,
  `/start`, `/pages`, `/sitemap` each call `res.sendFile(...)`. This lets users
  navigate without typing `.html`.
- **`transporter = nodemailer.createTransport(...)`** — Gmail SMTP. The
  password comes from `process.env.EMAIL_PASSWORD`, which is loaded by
  `require('dotenv').config()` at the top. **Must be a Gmail _App Password_**,
  not your account password (see `SMTP_SETUP_GUIDE.md`).
- **`POST /api/send-contact`** — validates fields, builds an HTML email,
  calls `transporter.sendMail()`, returns `{ success: true }` or an error
  payload. The `replyTo` is set to the sender's email so the owner can reply
  straight from Gmail.
- **`GET /api/health`** — liveness probe (`{ status: "Server is running" }`).
- **404 + error handlers** — last resort; the 404 handler tries
  `${req.path}.html` before giving up.

### 4.2 `package.json`

```jsonc
"scripts": {
  "start": "node server.js",
  "dev":   "nodemon server.js"   // dev-only, auto-restart
}
```

Dependencies: **express** (web server), **nodemailer** (email), **cors**
(cross-origin), **body-parser** (JSON parsing — redundant with
`express.json()` in modern Express but kept for clarity), **dotenv** (reads
`.env`). Dev-only: **nodemon**.

### 4.3 `.env`

```
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### 4.4 `start.html` — the welcome page

- **Purpose:** the first thing a visitor sees. Two big clickable cards:
  - **Explore the Experience** → `home.html` (marketing)
  - **Search Hospitals** → `index.html` (the app)
- **Implementation:** self-contained — all CSS is inline in a `<style>` block,
  no external JS. Uses `linear-gradient` + `backdrop-filter: blur()` for the
  glassmorphism look, and a CSS `@keyframes bounce` for the logo.
- Responsive: at `max-width: 600px` the two-column card grid collapses to one
  column.

### 4.5 `home.html` + `home-styles.css` + `home-script.js` — the landing page

**home.html** structure:

1. **Navbar** (`.aurora-navbar`) with mobile hamburger toggle.
2. **Hero** section with a `<canvas id="globe-canvas">` behind semi-transparent
   text ("Connect the World Through Health"), call-to-action button
   (`#explore-btn`), and three stats (`150+ Partner Hospitals`, etc).
3. **Features preview** — six feature cards (Global Network, AI Matching,
   GPS, Analytics, Security, Speed).
4. **About** teaser (text + check-mark list).
5. **CTA** — "Ready to Transform Healthcare?".
6. **Footer** — links + copyright.
7. **Redirect modal** — hidden; opened by `#explore-btn` to confirm navigation
   to `index.html`.

**home-script.js** does four things:

- **Navbar behavior** — hamburger toggle, click-to-close, active-link
  highlighting on scroll (`IntersectionObserver`-free; uses a `scroll`
  listener).
- **Modal behavior** — `#explore-btn` and friends open the redirect modal;
  `#modal-confirm` navigates to `index.html`; ESC / outside-click closes it.
- **Scroll animations** — uses `IntersectionObserver` to fade-in feature cards,
  stats, etc. when they enter the viewport.
- **`initGlobe()`** — draws an animated wireframe globe on the canvas using
  the 2D context. It draws:
  - latitude ellipses (`ctx.ellipse`) with decreasing width toward the poles,
  - longitude lines (projected sphere points via `cos(lat)·cos(lon)` etc.),
  - six glowing "city" markers using `createRadialGradient`,
  - an outer ring.
  - Rotation is driven by `time += 0.0005` each `requestAnimationFrame` tick.

### 4.6 `index.html` + `styles.css` + `data.js` + `app.js` — the real app

This is the core product. `index.html` just wires everything up; the two
scripts do the work. **Script order matters:** `data.js` is loaded _before_
`app.js` because `app.js` references the globals `HOSPITALS`,
`loadRealHospitals`, and `loadHospitalsForLocation` that `data.js` defines.

#### 4.6.1 `data.js` — GPS + OpenStreetMap

Responsible for getting the user's location and turning it into an array of
hospital objects.

- **`haversineKm(lat1, lon1, lat2, lon2)`** — straight-line distance on a
  sphere. Used to compute `distance` for each hospital from the user.
- **`getUserLocation()`** — wraps `navigator.geolocation.getCurrentPosition`
  in a `Promise`. 10-second timeout, high-accuracy mode.
- **`fetchOverpass(lat, lng, radiusMeters)`** — Strategy 1. Calls
  [Overpass API](https://overpass-api.de/) with an OSM-QL query that looks
  for `amenity=hospital` nodes and ways within `radius` meters. Parses the
  rich OSM tags (`addr:street`, `contact:phone`, `operator`, `emergency`,
  etc.). Uses `AbortController` for a 15s timeout.
- **`fetchNominatim(lat, lng, radiusMeters)`** — Strategy 2 (fallback).
  Calls [Nominatim](https://nominatim.openstreetmap.org/) with a bounding-box
  search. Less detail per result, but more reliable and CORS-friendly.
- **`fetchNearbyHospitals()`** — tries Overpass first, falls back to Nominatim
  if it fails or returns empty. Throws if both fail.
- **`parseOverpassResults()` / `parseNominatimResults()`** — normalize raw API
  responses into the common shape the rest of the app expects:
  ```js
  { id, name, area, city, address, distance, beds:{icu,general,emergency},
    phone, email, website, rating, lat, lng, emergency_service, operator }
  ```
  **Bed counts are simulated** — derived deterministically from the hospital's
  OSM id (`seed = el.id % 100`). OpenStreetMap doesn't provide live bed
  counts, so we invent plausible numbers for the demo.
- **`geocodeLocation(query)`** — turns a text query like "Mumbai" into
  `{lat, lng}` using Nominatim.
- **`loadRealHospitals(onStatus)`** — the initial flow: GPS → 10 km search →
  if <3 results, expand to 25 km → populate `HOSPITALS`.
- **`loadHospitalsForLocation(str, onStatus)`** — when the user types a
  place in the search box, geocode it and fetch hospitals around _that_
  point (no GPS needed).

`onStatus(state, msg)` is a callback into `app.js`'s `setGpsBanner` so the
banner shows `locating → fetching → done` (or an error state).

#### 4.6.2 `app.js` — rendering, filtering, AI, UI glue

Three logical layers:

**(a) Navbar + scroll-spy** (top of the file, DOMContentLoaded handler) —
same pattern as `home-script.js`: hamburger toggle, active-link on scroll,
smooth-scroll to anchors.

**(b) Hospital list UI:**

- `dom = { ... }` — one object caching every `getElementById` lookup (faster +
  cleaner than repeating `document.getElementById` everywhere).
- `filterHospitals(bedType, location)` — filters `HOSPITALS` by the location
  text (matches against `name/city/area/address`) and drops hospitals with
  zero of the selected bed type. Sorted by distance.
- `createHospitalCard(hospital, isNearest)` — builds the card DOM. Marks the
  closest hospital with the `nearest` class so it gets a highlighted border.
  Two outgoing links: "Directions" (`maps.google.com/maps/dir/...`) and "View
  Details" (a search on Google Maps).
- `renderHospitals(...)` — clears the grid and appends cards, or shows the
  empty state.
- `simulateBedUpdate()` — every 30 seconds (`setInterval` in `initApp`),
  picks a random bed type for each hospital and `±1`s the count (bounded at
  0). This is the "real-time" effect — purely cosmetic.

**(c) AI symptom analysis (Gemini):**

- `GEMINI_API_KEY` is **currently hardcoded** at the top of the file. ⚠️ In
  production this must move to the backend — anyone who views the source can
  read it.
- `GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash",
  "gemini-2.0-flash-lite"]` — fallback chain; we try each if the previous one
  fails.
- `analyzeSymptoms()`:
  1. Builds a long system-like prompt that gives strict triage rules for
     **General / Emergency / ICU**, asks for a JSON-only response, and adds
     home-remedy guidance.
  2. Loops over the model fallback chain; for each model, retries up to 5
     times on HTTP 429 with exponential backoff (1s, 2s, 4s, 8s, 16s).
  3. Strips possible code fences from the response, `JSON.parse`s it.
  4. Normalizes `bedType` with `includes('icu' | 'general' | 'emergency')`
     defaulting to `General` (safer for ambiguous cases).
  5. Renders the recommendation card + optional home-remedy list.
- `applyAiFilter()` — triggered by the "Apply Filter & View Hospitals ↓"
  button on the AI result card. Sets the bed-type dropdown to the AI's
  suggestion, re-renders, and scrolls to the hospital list.

**(d) Initialization** — `initApp()` is called at the very bottom of the file:
show loading → `loadRealHospitals(setGpsBanner)` → render → start the 30-second
bed-update interval. On error it shows the empty state.

**(e) Event listeners** — at the bottom of `app.js`:
- Search button → filter or (if location typed) re-fetch from OSM.
- Enter key on location input → triggers search.
- Analyze button → `analyzeSymptoms`.
- AI Apply button → `applyAiFilter`.
- Modal close + ESC + outside-click all close the details modal.
- GPS retry button → re-runs `initApp()`.

#### 4.6.3 `styles.css`

Defines a **CSS custom-property design system** (colors in the `:root` block:
`--blue-*`, `--green-*`, `--red-*`, `--gray-*`, plus an Aurora palette for
accents). Keeps all visual constants in one place.

Key sections (in order):
1. Variables & reset.
2. Aurora animations (`@keyframes aurora-glow`, etc.) and the navbar styles
   used by every page.
3. Container layout, header, GPS banner, search section, AI section,
   hospital grid, hospital card, modal, footer, spinners / loaders.
4. Media queries for phone-sized screens at the bottom.

### 4.7 `about.html`, `features.html`, `contact.html`, `pages-index.html`, `sitemap.html`

All share **`home-styles.css`** (for the navbar / footer / hero chrome) and
**`pages-styles.css`** (page-specific sections like mission cards, feature
categories, FAQ), and all load **`pages-script.js`** (nav + redirect modal).

- **`about.html`** — static content: mission, vision, values, timeline, team.
- **`features.html`** — grouped deep-dive into features (global connectivity,
  AI, analytics, security, integrations).
- **`contact.html`** — **important**: this is the only page that hits the
  backend. At the bottom of the file there's an inline `<script>` with:
  - `handleContactForm(event)` — `fetch('http://localhost:5000/api/send-contact', { method: 'POST', body: JSON.stringify(formData) })`, handles success / error paths, and toggles the form vs. the success message.
  - `handleDemoForm(event)` — stub that just shows an alert.
  - `toggleFAQ(el)` — expands/collapses the FAQ answer by toggling a `hidden`
    class and flipping the `+` / `−` icon.
- **`pages-index.html`** — developer-facing index of all pages (useful for
  walking through the app without clicking through the real UI).
- **`sitemap.html`** — user-facing HTML sitemap.

### 4.8 `pages-script.js`

Shared between `about/features/contact/sitemap`. Implements the same navbar
toggle as `home-script.js` (no globe canvas here), wires the "Experience Live
App" button to the redirect modal, and sets the `active` class on the current
page's nav link via `updateActiveNavLink()` (it matches the URL's last path
segment against each `<a href>`).

### 4.9 `home-styles.css` and `pages-styles.css`

Both use the same design tokens and naming conventions as `styles.css`.
`home-styles.css` holds the marketing chrome (navbar, hero with canvas,
feature/about/CTA/footer sections, modal shell). `pages-styles.css` adds
page-specific pieces (mission grid, detailed feature categories, FAQ grid,
contact form inputs).

### 4.10 `start-backend.bat`, `QUICK_START_PAGES.sh`

Convenience scripts to install deps and run the server (`.bat` for Windows,
`.sh` for bash). They also nudge the user if `.env` is missing.

---

## 5. End-to-end data flow cheat-sheet

**User opens the site:**

1. `GET /` → `server.js` returns `start.html` (because static middleware is
   configured with `index: false`).
2. User clicks "Search Hospitals" → `index.html`.
3. `index.html` loads `data.js` then `app.js`.
4. `initApp()` runs → `loadRealHospitals(setGpsBanner)`:
   - `getUserLocation()` → browser prompts for GPS permission.
   - `fetchNearbyHospitals(lat, lng, 10000)` tries Overpass, falls back to
     Nominatim.
   - Results normalized into `HOSPITALS[]`.
5. `renderHospitals('all', '')` paints the grid.
6. Every 30 s, `simulateBedUpdate()` tweaks counts to mimic live data.

**User types symptoms and clicks Analyze:**

1. `analyzeSymptoms()` builds the prompt, calls Gemini (with retries).
2. JSON response → `{bedType, explanation, homeRemedy}`.
3. Card renders; user clicks "Apply Filter & View Hospitals ↓".
4. `applyAiFilter()` sets the dropdown and scrolls to the hospital list.

**User submits the contact form:**

1. `handleContactForm(event)` → `fetch POST http://localhost:5000/api/send-contact`.
2. `server.js` validates, sends email via Nodemailer / Gmail SMTP.
3. Returns JSON; the page swaps form for a success message.

---

## 6. Gotchas and things to know

1. **`/` must show `start.html`.** The `{ index: false }` option on
   `express.static` in [server.js:24](server.js#L24) is load-bearing — remove
   it and Express auto-serves `index.html` for `/`, bypassing the route that
   sends `start.html`.
2. **The Gemini API key is in client-side JS** ([app.js:105](app.js#L105)).
   It's exposed to anyone who views source. Fine for demo; move to the
   backend before any real deployment.
3. **Bed counts are fake.** They come from `hospital.id % 100` in
   [data.js:66-78](data.js#L66-L78) and are perturbed every 30 seconds. OSM
   has no live bed data.
4. **Two mail addresses are hardcoded** in `server.js` as fallbacks:
   `jb1270628@gmail.com`. The `.env` values should override them; keep both in
   sync when changing owner.
5. **The contact form hardcodes `http://localhost:5000`** in
   `contact.html`. If you deploy, change this to a relative URL
   (`/api/send-contact`) or a config value.
6. **`index.html` has a `<body>` `padding-top: 70px`** coming from
   `styles.css` — that's the space for the fixed navbar. If the navbar height
   changes, update this.
7. **Third-party APIs have rate limits.** Overpass and Nominatim can throttle
   or go down; the try-Overpass-then-Nominatim fallback mitigates this but
   doesn't eliminate it. Gemini 429s are handled with exponential backoff.
8. **The `HOSPITALS` array is global** (declared in `data.js`) and mutated by
   both `data.js` (on load) and `app.js` (`simulateBedUpdate`). This is fine
   for a single-page demo; if you ever split into modules, pass it
   explicitly.

---

## 7. Running it locally

```bash
# 1. install
npm install

# 2. create .env from the guide in SMTP_SETUP_GUIDE.md
#    EMAIL_USER=you@gmail.com
#    EMAIL_PASSWORD=<gmail app password>

# 3. start
npm start          # production-style
npm run dev        # with nodemon, auto-restart on save

# 4. open
http://localhost:5000/       # → start.html
http://localhost:5000/home   # → home.html
http://localhost:5000/index  # → the app
```

Or on Windows: double-click `start-backend.bat`.

---

## 8. Where to look when something breaks

| Symptom | Check |
| --- | --- |
| `/` shows the app instead of the welcome page | `{ index: false }` option removed from [server.js:24](server.js#L24) |
| Contact form says "Cannot connect to server" | Backend not running (`npm start`), or CORS origin not in the whitelist at [server.js:13](server.js#L13) |
| Contact form fails with SMTP error | `.env` missing or `EMAIL_PASSWORD` is not a Gmail **App Password** (see `SMTP_SETUP_GUIDE.md`) |
| Hospital list is empty, banner is red | GPS denied, or both Overpass and Nominatim failed (network / CORS / rate limit). Try the "Retry Location" button or type a city in the search box |
| AI analysis errors | Gemini key expired, quota exceeded, or all three models returned 429. See `GEMINI_MODELS` in [app.js:106](app.js#L106) |
| Globe canvas is blank | `initGlobe()` didn't find `#globe-canvas` — make sure it runs on `home.html` only (it's a no-op elsewhere) |
| Nav active link doesn't highlight | The page's URL last segment must match `<a href>` exactly; see `updateActiveNavLink()` in [pages-script.js:110](pages-script.js#L110) |

---

That's the whole tour. If you add a new page or a new API endpoint, extend
the route list in `server.js`, add a link to `home.html`'s navbar, and — if it
needs its own scripts — create a new `*-script.js` so `home-script.js` stays
focused on the landing page.
