# Software Gaze — Office Portal (Frontend)

> Frontend for the Software Gaze Office Portal. Responsive, Vite-powered, and designed to work seamlessly with the backend API.

---

## Table of Contents

* [Project Overview](#project-overview)
* [Live Demo](#live-demo)
* [Key Features](#key-features)
* [Tech Stack](#tech-stack)
* [Folder Structure](#folder-structure)
* [Prerequisites](#prerequisites)
* [Local Setup](#local-setup)
* [Environment Configuration](#environment-configuration)
* [Scripts](#scripts)
* [Building & Deployment](#building--deployment)
* [Connecting to the Backend](#connecting-to-the-backend)
* [Testing & Linting](#testing--linting)
* [Accessibility & Performance](#accessibility--performance)
* [Contributing](#contributing)
* [Roadmap](#roadmap)
* [License](#license)
* [Maintainer / Contact](#maintainer--contact)

---

## Project Overview

This repository contains the frontend application for the **Software Gaze — Office Portal**. The UI focuses on fast expense entry, slip uploads, and clear reporting dashboards so admins can export monthly and yearly reports and quickly filter by status (e.g. `paid`, `unpaid`, `all`). Version 2 contains major frontend improvements to UX, responsiveness, and reporting visuals.

---

## Live Demo

Add your deployed demo URL here (Netlify / Vercel / static hosting). Example:

```
https://your-frontend-demo.example.com
```

---

## Key Features

* Responsive dashboard with statistical diagrams for quick insights.
* Expense creation form with image upload (transaction slip screenshots).
* Expense list with tag-wise filtering (paid / unpaid / all) and pagination.
* Export reports (CSV / PDF) for monthly and yearly periods.
* Role-aware UI flows (Admin vs. User) — UI adapts to permissions exposed by the backend.
* Form validation and friendly inline error messages.

---

## Tech Stack

This project uses modern frontend tooling to keep builds fast and developer experience smooth.

* Vite — fast build tool and dev server
* Modern JavaScript (ESModules) — compatible with newest browsers
* UI Library / CSS framework — e.g. Tailwind CSS (adjust to your stack)
* Charting library — e.g. Chart.js / Recharts for dashboard visualizations
* Axios / Fetch API — for REST communication with backend
* Optional: TypeScript (if enabled in your repo)

> If your repo uses a different stack (React / Vue / Svelte), replace the above items accordingly.

---

## Folder Structure (recommended)

```
src/
  ├─ components/         # Reusable UI components (Buttons, Inputs, Modals)
  ├─ pages/              # Page-level components (Dashboard, Expenses, Settings)
  ├─ services/           # API client and services (expenseService.js)
  ├─ stores/             # State management (Context, Redux, Pinia)
  ├─ assets/             # Images, icons, fonts
  ├─ styles/             # Global CSS / Tailwind config
  └─ main.js / main.ts    # App bootstrap

public/                  # Static files
vite.config.js           # Vite config
package.json             # Scripts & dependencies
.env.local               # Local environment variables
```

---

## Prerequisites

* Node.js 16+ (LTS recommended)
* npm or yarn
* Access to the backend API (running locally or remote)

---

## Local Setup

1. Clone the repository:

```bash
git clone https://github.com/Ajmayen27/SoftwareGaze-Office-Portal-Frontend.git
cd SoftwareGaze-Office-Portal-Frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a local environment file (see Environment Configuration below).

4. Start the dev server:

```bash
npm run dev
# or
yarn dev
```

The app will typically be available at `http://localhost:5173` (or the port shown by Vite).

---

## Environment Configuration

Create a `.env.local` or `.env` file in the project root with the following example keys:

```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_MOCK=false
VITE_APP_TITLE="Software Gaze"
```

* `VITE_API_BASE_URL` should point to your backend API endpoint. Vite exposes environment variables prefixed with `VITE_` to client code.
* Keep any secrets on the server-side only. Do not store sensitive secrets in frontend env files.

---

## Scripts

Common npm scripts (update them to reflect your `package.json`):

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint --ext .js,.jsx,.ts,.tsx src/",
    "test": "jest"
  }
}
```

---

## Building & Deployment

1. Build for production:

```bash
npm run build
# or
yarn build
```

2. Serve the `dist/` folder via any static host (Netlify, Vercel, GitHub Pages) or behind a CDN.

3. If deploying with Docker, create a small Nginx container that serves the `dist/` directory.

---

## Connecting to the Backend

* The frontend expects a REST API for authentication, expenses, and reports. Example endpoints the frontend integrates with:

```
POST   /api/auth/login
GET    /api/expenses?status=paid&month=2026-02
POST   /api/expenses // multipart/form-data for image upload
GET    /api/reports/export?period=monthly&year=2026
```

* Ensure CORS is enabled on the backend and the `VITE_API_BASE_URL` matches the backend base URL.

---

## Testing & Linting

* Unit tests: add Jest / Vitest tests for components and services.
* E2E tests: consider Cypress or Playwright for high-value flows (login, upload, export).
* Linting & formatting: ESLint + Prettier recommended.

---

## Accessibility & Performance

* Use semantic HTML and ARIA attributes for screen-reader friendliness.
* Optimize images (resize/compress) before upload.
* Use code-splitting and lazy-loading on heavy dashboard modules to keep initial bundle small.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Follow the project's code style and commit conventions.
3. Add tests for new behavior.
4. Open a PR with a detailed description and screenshots if relevant.

---

## Roadmap

Planned frontend improvements:

* Mobile-first layout improvements and progressive web app (PWA) support
* Drag-and-drop for image uploads
* Dark mode and theming
* Improved offline handling for quick expense drafts

(Work on additional features is in progress for upcoming releases.)

---

## License

This project is licensed under the MIT License. Update if you prefer a different license.

---

## Maintainer / Contact

**Ajmayen Fayek** — add your email or link to GitHub profile for collaborators.

---

### Quick Commands

```bash
# install deps
npm install

# run dev server
npm run dev

# build for production
npm run build
```

*Replace placeholders (demo URL, exact scripts, and library names) with specifics from your project. Add screenshots and component documentation where useful.*
