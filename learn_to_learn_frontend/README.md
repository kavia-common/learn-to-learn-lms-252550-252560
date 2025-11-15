# BrainBoost React Frontend

This project is the BrainBoost (formerly "Learn To Learn") frontend, a lightweight React app with a clean, modern UI and minimal dependencies.

## Branding and Theme

- App name: BrainBoost
- Document title and visible titles use "BrainBoost"
- Theme tokens are defined in `src/App.css` using CSS variables:
  - Primary: `#2563EB` (blue)
  - Accent: `#F59E0B` (amber)
  - Error: `#EF4444`
  - Background: `#f9fafb` (light), dark mode surfaces enabled
  - Typography: Inter/system stack

These choices follow the Ocean Professional style with updates informed by the provided reference image (subtle gradient header, rounded components, soft shadows).

## Features

- **Routing**: React Router v6 with protected and role-based routes
- **Lightweight**: Vanilla CSS + React
- **Modern UI**: Subtle gradients, rounded corners, accessible contrast
- **Dark Mode**: Toggle via the UI theme switch
- **Responsive**: Cards and layout adapt to screen sizes

## Routes

- `/` Home (public)
- `/dashboard` (protected)
- `/courses` (protected)
- `/schedule` (protected)
- `/analytics` (protected)
- `/admin` (protected + admin only)

Auth is mocked via `localStorage` under key `bb_auth`:
```json
{
  "isAuthenticated": true,
  "user": { "id": "u1", "name": "Alex", "role": "admin" }
}
```

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

## Customization

Update theme variables in `src/App.css`:
```css
:root {
  --primary: #2563EB;
  --accent: #F59E0B;
  --bg-primary: #f9fafb;
  --text-primary: #111827;
}
```

Components use classes such as:
- `.navbar`, `.brand`, `.brand-badge`, `.brand-text`
- `.btn`, `.btn-primary`, `.btn-outline`
- `.cards`, `.card`, `.card-title`, `.card-desc`

## Environment Variables

Do not change or add environment variables. Continue using the existing `REACT_APP_*` values provided in the environment (e.g., `REACT_APP_API_BASE`, `REACT_APP_BACKEND_URL`, etc.).

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
