# CardioShield (Cardio) - Full-stack Heart Risk Assessment

>A compact full-stack project: React/Vite frontend, Node/Express backend, and a Flask AI microservice for heart disease prediction (LightGBM + ensemble models).

## Repository Layout

- `client/` — React + Vite frontend (UI for administrators and customers)
- `server/` — Node.js / Express API, MongoDB models, authentication and file uploads
- `ai-backend/` — Flask API serving ML models for quick prediction and full assessments
- `how to run` — quick run hints

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, Framer Motion, GSAP, React Router
- **Backend:** Node.js (Express), MongoDB (Mongoose), JWT auth, Multer, Cloudinary
- **AI Service:** Python (Flask), scikit-learn, LightGBM, XGBoost, TabNet, joblib, pandas, numpy
- **Dev & Tooling:** Vite, ESLint, Nodemon, Axios, dotenv
- **Languages:** JavaScript (ES Modules), Python 3.10+

## Quickstart (Windows / PowerShell)

Prerequisites:
- Node.js 18+ and npm
- Python 3.10+ and pip
- MongoDB (local or Atlas)

1) Install and start the server

```powershell
cd server
npm install
# start in dev mode (requires nodemon)
npm run dev
```

The server listens by default on `http://localhost:4500` (see `server/index.js`).

Run the admin seeder (optional):

```powershell
npm run seed:admin
```

2) Install and start the AI backend

```powershell
cd ..\ai-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The AI service runs on `http://localhost:5001` and exposes endpoints described below. Models are loaded from `ai-backend/models`.

3) Install and start the client

```powershell
cd ..\client
npm install
npm run dev
```

The frontend runs with Vite (default port shown in the terminal, commonly `5173`). The frontend config uses `http://localhost:4500` as the API base (`client/src/config/api.jsx`).

## Environment Variables

Create a `.env` (in `server/`) with values similar to:

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/dbname
JWT_SECRET=supersecretkey
PORT=4500
AI_BACKEND_URL=http://localhost:5001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GMAIL_USER=youremail@gmail.com
GMAIL_PASSCODE=app-specific-password
```

AI backend does not require specific env vars to run the included `app.py`, but you may set `FLASK_ENV` or a custom port in your environment if desired.

## AI Backend - Endpoints (summary)

- `GET /health` — health & loaded model status
- `POST /predict` — quick return using LightGBM (expects 13 UCI features in `input` JSON)
- `POST /assess` — full assessment using multiple models (send `patientData` or `input`)
- `GET /metrics` — model metrics
- `GET /fairness` — fairness statistics
- `POST /explain` — feature explanation

See `ai-backend/app.py` for details and example payloads.

## Notes & Tips

- Frontend expects the main API at `http://localhost:4500` (adjust `client/src/config/api.jsx` if needed).
- AI models must be placed in `ai-backend/models/` to enable `/predict` and `/assess` functionality. One model (`heart_disease_predictor.pk2`) is referenced by default for LightGBM.
- The server uses `process.env.MONGO_URI` and several other env vars (Cloudinary, JWT secret, Gmail credentials). See `server/src/config` and `server/src/utils` for usages.

## Scripts of interest

- Client: `npm run dev`, `npm run build`, `npm run preview` (`client/package.json`)
- Server: `npm run dev` (runs `nodemon index.js`), `npm run seed:admin` (`server/package.json`)
- AI: run `python app.py` after installing `requirements.txt`.

## Contributing

1. Fork the repo and create a feature branch
2. Ensure linting passes (`npm run lint` in `client`)
3. Open a pull request with a clear description

## Testing & Validation

- There are no formal test suites in this repo. Manual checks:
  - Start the server and visit `http://localhost:4500/` API routes
  - Start AI backend and query `http://localhost:5001/health`
  - Start client and verify UI flows for login, AI assessment and admin pages

## Deployment

- Build the client: `cd client && npm run build` and serve the `dist` with a static server or integrate with the Node server.
- Deploy the `server/` to a Node hosting platform (Heroku, Render, DigitalOcean) and set environment variables.
- Deploy the `ai-backend/` to a Python host (Render, Fly, or a VM) and ensure `models/` are present.

## License & Contact

This repository includes mixed source types. Add a LICENSE file if you want a formal license. For questions, open an issue or contact the project maintainer.

---

Generated README for local development and quick onboarding.
