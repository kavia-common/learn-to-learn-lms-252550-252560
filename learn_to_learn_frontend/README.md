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
- **State**: Redux Toolkit + react-redux
- **Auth**: Redux auth slice with localStorage persistence (key: `bb_auth`)
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

### Auth Model (Prototype)

Auth is mocked and persisted under key `bb_auth` and hydrated into Redux on app start.

Shape:
```json
{
  "isAuthenticated": true,
  "user": { "id": "u1", "name": "Alex", "role": "admin" }
}
```

Redux actions:
- `auth/loadFromStorage` hydrates on startup
- `auth/login`, `auth/register` set user and persist
- `auth/logout` clears user and localStorage

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

### Remote API Mode (optional)

You can enable remote API integration instead of local/mock data by setting the following environment variables:

- REACT_APP_FEATURE_FLAGS=remote
- REACT_APP_API_BASE=<remote API base URL>

Example .env settings for DummyJSON:
```
REACT_APP_FEATURE_FLAGS=remote
REACT_APP_API_BASE=https://dummyjson.com
```

Notes:
- Ensure the remote API has CORS enabled to allow requests from your frontend origin (e.g., http://localhost:3000). DummyJSON already supports CORS.
- When remote mode is active and using DummyJSON:
  - Subjects: GET /products/categories
  - Course list:
    - By category: GET /products/category/{category}?limit=20&skip={page*20}&select=id,title,description,price,thumbnail,rating,brand,category
    - By search: GET /products/search?q={term}&limit&skip&select=...
    - Default list: GET /products?limit&skip&select=...
  - Course details: GET /products/{id}
  - Mapping:
    - Category { id: slug(categoryName), name, description:'', color }
    - Course { id, title, description, categoryId, level(derived from rating), durationMinutes(price*2), lessonsCount(stock/10), author(brand), tags:[], thumbnailUrl, publishedAt:null, status:'published' }
- Progress PATCH is mocked locally:
  - Service: progressService.update({ id|courseId, percent }) writes to localStorage key: bb_progress_{userId} (userId optional)
  - Returns updated progress object: { id, userId, courseId, percent, updatedAt }
- Catalog:
  - Shows subjects as filters and supports search (q) and pagination (limit/skip). Query params are preserved for back/forward navigation.
- After changing env vars, restart the dev server.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
