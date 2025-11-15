# BrainBoost React Frontend

This project is the BrainBoost (formerly "Learn To Learn") frontend, a lightweight React app with a clean, modern UI and minimal dependencies.

## Remote Data Source (Strapi Demo)

You can enable fetching categories and courses from the Strapi Demo API.

- Set `REACT_APP_API_BASE=https://demo.strapi.io/api`
- Enable remote feature by adding `remote` to `REACT_APP_FEATURE_FLAGS` (comma-separated)
- See `.env.example` for a ready-to-copy configuration

When remote is disabled or Strapi is unavailable, the Category dropdown falls back to a curated local taxonomy and the catalog shows an empty state for courses.

## Getting Started

- Copy `.env.example` to `.env` and adjust as needed.
- Run `npm start` to launch the app on http://localhost:3000
