# World Pet — Frontend

The modern, responsive web interface for the World Pet platform. Built with React, TypeScript, and Tailwind CSS, featuring a premium dark-themed design with glassmorphism effects and fluid animations.

## 🚀 Tech Stack

- **React 18** — UI Library
- **TypeScript** — Static typing for robust code
- **Vite** — High-performance build tool
- **Tailwind CSS** — Utility-first styling with custom dark theme
- **Framer Motion** — Industry-standard animation library
- **Vitest + RTL** — Unit and integration testing
- **Lucide React** — Icon suite

## 🛠️ Getting Started

### Prerequisites
- Node.js (v22+)
- npm

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Development
```bash
# Start dev server with HMR
npm run dev
```
The app will be available at `http://localhost:5173`.

### Testing & Quality
```bash
# Run unit tests (Vitest)
npm test

# Run tests in watch mode
npm run test:watch

# Type-check with tsc
npm run typecheck

# Lint with ESLint
npm run lint
```

### Production Build
```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📂 Project Structure

```text
frontend/
├── src/
│   ├── assets/             # Static assets (images, fonts)
│   ├── components/
│   │   ├── layout/         # AppShell, Sidebar, PageHeader
│   │   └── ui/             # Reusable base components (Button, Input, etc.)
│   ├── lib/                # Shared utilities & animation variants
│   ├── pages/              # Page components (Dashboard, Pets, etc.)
│   ├── styles/             # Global CSS & Tailwind design tokens
│   ├── App.tsx             # Root component & Routing
│   └── main.tsx            # Entry point
├── public/                 # Static public files (favicons, manifest)
├── tailwind.config.js       # Design system configuration
├── vitest.config.ts        # Test runner configuration
└── vite.config.ts          # Bundler configuration
```

## ✨ Features

- **Premium Dark Mode**: Curated color palette optimized for low-light environments.
- **Glassmorphism**: Subtle backdrop blurs and semi-transparent surfaces for a modern feel.
- **Micro-interactions**: Spring-based animations on buttons and interactive elements.
- **Responsive Layout**: Persistent sidebar on desktop with a liquid main content area.
- **Type-Safe Development**: Comprehensive TypeScript definitions for components and props.
