# ISHMS Frontend

A web-based frontend for ISHMS, a hospital management system. The application provides role-specific dashboards for receptionists, doctors, nurses, and administrators, along with a set of analytics dashboards for hospital-wide monitoring, all served from a single React single-page application.

## Tech Stack

- **React 19** with **Vite 8** as the build tool
- **React Router v7** for client-side routing
- **Tailwind CSS** for styling (Reception, Doctor, Auth, and Shared screens)
- **Recharts** for data visualization
- **@microsoft/signalr** for real-time updates
- **Axios** and the native Fetch API for HTTP requests
- **TanStack Query** for data caching infrastructure
- **Zustand** for local feature state
- **Express** for serving the production build

## Features

- **Authentication** — token-based login with role detection, persisted across page refreshes.
- **Reception** — patient admission wizard, ward-wide bed management (grid and list views), discharge queue, and patient lookup.
- **Doctor** — patient triage dashboard sorted by clinical priority, a detailed patient view with vitals trends, medication and clinical notes, ISBAR handover review, drug interaction checks, and medical report authoring.
- **Nurse** and **Admin** — dedicated dashboards and workflows for nursing and administrative staff.
- **Analytics** — Executive, Clinical, and Operations dashboards with live-refreshing KPIs and charts for hospital-wide monitoring.
- **Real-time updates** — live alerts, status updates, and task notifications delivered over SignalR.

## Project Structure

```
src/
├── App.jsx              # Routing and role-based layout switching
├── main.jsx              # Application entry point
├── features/
│   ├── AuthPage.jsx       # Login screen
│   ├── Auth/              # Authentication context
│   ├── APIS/              # Central API client, formatting helpers, SignalR hook
│   ├── Shared/             # Layout shell, shared data context, shared pages/components
│   ├── Reception/          # Reception dashboard and workflows
│   ├── Doctor/             # Doctor dashboard and patient detail view
│   ├── Analysis/           # Executive / Clinical / Operations analytics dashboards
│   ├── Admin/              # Admin dashboard and workflows
│   └── Nurse/              # Nurse dashboard and workflows
└── styles/                 # Global CSS
```

For a more detailed breakdown of the architecture, routing, state management, and components, see `Frontend_Documentation.md`.

## Getting Started

### Prerequisites

- Node.js (a recent LTS version)
- npm

### Installation

```bash
git clone https://github.com/Hixotic/ishms-frontend.git
cd ishms-frontend
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
VITE_API_BASE_URL=<your backend API base URL>
VITE_HUB_URL=<your SignalR hub URL>
```

If these are not set, the app falls back to a default backend URL configured in the source.

### Running the App

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Serve the production build with the included Express server:

```bash
npm run build
npm start
```

### Configuration

`public/config.json` controls the application's `apiMode` flag, which can be set to `"mock"` or `"live"` to configure the app's data-access mode independently of the build.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the app for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |
| `npm start` | Serve the production build with Express |