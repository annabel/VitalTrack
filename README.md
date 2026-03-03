# VitalTrack — Health Tracker

A modern, clean health tracking app built with **React + TypeScript + Vite** and **Tailwind CSS**.

![VitalTrack Dashboard](https://github.com/user-attachments/assets/9cdd8266-c6b7-48bc-9767-39144df9119c)

## Features

- 📊 **Dashboard** — Overview of today's metrics with progress bars towards daily goals
- 📝 **Log Today** — Easily input steps, water intake, sleep, calories, workout minutes, and weight
- 🎯 **Goals** — Customise your personal daily targets and patient name for each metric
- 📈 **Weekly Trends** — Area charts showing the last 7 days for each metric
- 📋 **Vitals Summary** — Tabular view of vitals for the last 7 days, 30 days, or all time, with averages
- 📄 **Export PDF** — Generate a formatted PDF from the Vitals Summary, including patient name, date range, data table with averages, and a steps bar chart
- 💾 **Local storage** — All data persists in the browser with no backend required

## Tech Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev) for fast development and builds
- [Tailwind CSS v4](https://tailwindcss.com) for styling
- [Recharts](https://recharts.org) for weekly trend charts
- [Lucide React](https://lucide.dev) for icons
- [jsPDF](https://github.com/parallax/jsPDF) (`jspdf`) — PDF document generation
- [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) (`jspdf-autotable`) — Table plugin for jsPDF used to render the vitals data table in exported PDFs

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
