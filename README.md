# BrainBoost LMS (formerly Learn To Learn)
This repository hosts the BrainBoost front-end (React) application. Branding was updated from "Learn To Learn" to "BrainBoost" and the UI theme aligns with the Ocean Professional style with blue primary (#2563EB) and amber accents (#F59E0B), refined to match the provided reference.

- Frontend container: learn_to_learn_frontend
- Framework: React (Create React App)
- Status: Branding and theme updated

## Remote API Mode (Frontend)

To point the frontend at a remote API instead of local/mock storage:

- Set REACT_APP_FEATURE_FLAGS=remote
- Set REACT_APP_API_BASE to the API base URL (e.g., https://dummyjson.com)

CORS: The remote API must allow your frontend origin (e.g., http://localhost:3000). If requests are blocked, enable CORS on the API or use a dev proxy.

Document title and PWA manifest have been updated to: BrainBoost.