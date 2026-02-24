# CardioShield AI - Heart Disease Risk Assessment Platform

> A full-stack heart disease risk assessment platform featuring React/Vite frontend, Node.js/Express backend, and a Flask AI microservice with multiple ML models (XGBoost, TabNet, Neural Network, and Ensemble models) trained on 70,000+ cardiovascular records.

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Server Setup](#2-backend-server-setup)
  - [3. AI Backend Setup](#3-ai-backend-setup)
  - [4. Frontend Client Setup](#4-frontend-client-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
  - [Server API Endpoints](#server-api-endpoints)
  - [AI Backend Endpoints](#ai-backend-endpoints)
- [Default Ports](#default-ports)
- [Troubleshooting](#troubleshooting)

---

## Overview

CardioShield AI is an intelligent healthcare platform that predicts cardiovascular disease risk using machine learning. The system provides personalized health recommendations based on patient data analysis, offering both quick predictions and comprehensive assessments using multiple ML models.

## Features

- **Multi-Model AI Predictions**: XGBoost, TabNet, Neural Network, and Weighted Ensemble models
- **User Authentication**: JWT-based secure login/registration system
- **Admin Dashboard**: Manage users, view assessments, and analytics
- **Risk Assessment History**: Track patient assessments over time
- **Personalized Recommendations**: AI-generated health recommendations
- **Fairness Analysis**: Model bias detection across demographics
- **Feature Explainability**: Understand which factors impact predictions

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool & Dev Server |
| Tailwind CSS | Styling |
| Recharts | Data Visualization |
| Framer Motion | Animations |
| GSAP | Advanced Animations |
| React Router | Navigation |
| Axios | HTTP Client |

### Backend (Node.js Server)
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express 5 | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| JWT | Authentication |
| Cloudinary | Image Upload |
| Nodemailer | Email Service |
| Multer | File Upload Handling |

### AI Backend (Python)
| Technology | Purpose |
|------------|---------|
| Python 3.10+ | Language |
| Flask | Web Framework |
| scikit-learn | ML Library |
| XGBoost | Gradient Boosting |
| LightGBM | Gradient Boosting |
| TabNet | Neural Network |
| pandas/numpy | Data Processing |
| joblib | Model Serialization |

---

## Project Structure

```
CardioShield-AI/
├── client/                      # React Frontend (Port 5173)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Admin/           # Admin dashboard components
│   │   │   ├── AI/              # AI assessment components
│   │   │   └── Customer/        # Customer dashboard components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context (Auth)
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API service layer
│   │   └── config/              # Configuration files
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js Backend (Port 4500)
│   ├── src/
│   │   ├── config/              # DB & Cloudinary config
│   │   ├── controllers/         # Route handlers
│   │   ├── middlewares/         # Auth middleware
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API routes
│   │   ├── seeders/             # Database seeders
│   │   └── utils/               # Utility functions
│   ├── index.js                 # Entry point
│   └── package.json
│
├── ai-backend/                  # Python AI Service (Port 5001)
│   ├── app.py                   # Flask API (~800 lines)
│   ├── train_models.py          # Model training script
│   ├── requirements.txt         # Python dependencies
│   └── models/                  # Trained ML models
│       ├── xgboost_model.pkl
│       ├── tabnet_model.pkl
│       ├── nn_model.pkl
│       ├── ensemble_model.pkl
│       ├── scaler.pkl
│       └── cardio_train.csv     # Training dataset
│
└── README.md
```

---

## Prerequisites

Before installation, ensure you have the following installed:

| Requirement | Version | Download Link |
|-------------|---------|---------------|
| Node.js | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| Python | 3.10 or higher | [python.org](https://www.python.org/downloads/) |
| MongoDB | 6.x or Atlas | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Git | Latest | [git-scm.com](https://git-scm.com/downloads) |

### Verify Installations

```powershell
# Check Node.js
node --version    # Should output v18.x.x or higher

# Check npm
npm --version     # Should output 9.x.x or higher

# Check Python
python --version  # Should output Python 3.10.x or higher

# Check pip
pip --version     # Should output pip 23.x.x or higher

# Check Git
git --version     # Should output git version 2.x.x
```

---

## Installation

### 1. Clone the Repository

```powershell
# Clone the repository
git clone https://github.com/your-username/CardioShield-AI.git

# Navigate to project directory
cd CardioShield-AI
```

---

### 2. Backend Server Setup

```powershell
# Navigate to server directory
cd server

# Install Node.js dependencies
npm install

# Create environment file
# Copy the template below and save as .env in the server folder
```

#### Create `server/.env` file:

```env
# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/cardioshield

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Server
PORT=4500

# AI Backend URL
AI_BACKEND_URL=http://localhost:5001

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSCODE=your-app-specific-password
```

#### Seed Admin User (Optional)

```powershell
# Create default admin user
npm run seed:admin
```

---

### 3. AI Backend Setup

```powershell
# Navigate to ai-backend directory
cd ..\ai-backend

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# For Command Prompt use:
# .venv\Scripts\activate.bat

# For macOS/Linux use:
# source .venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install Python dependencies
pip install -r requirements.txt
```

#### AI Backend Dependencies (requirements.txt):

```
flask>=2.3.0
flask-cors>=4.0.0
numpy>=1.23.0
pandas>=2.0.0
scikit-learn>=1.2.0
joblib>=1.2.0
lightgbm>=3.3.0
```

#### Train Models (Optional - if models not included)

```powershell
# Train all ML models (creates .pkl files in models/)
python train_models.py
```

---

### 4. Frontend Client Setup

```powershell
# Navigate to client directory
cd ..\client

# Install Node.js dependencies
npm install
```

---

## Environment Variables

### Server Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `PORT` | Server port (default: 4500) | No |
| `AI_BACKEND_URL` | AI service URL (default: http://localhost:5001) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `GMAIL_USER` | Gmail address for sending emails | Yes |
| `GMAIL_PASSCODE` | Gmail app-specific password | Yes |

### AI Backend Environment Variables (Optional)

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Flask environment | production |
| `FLASK_PORT` | Flask server port | 5001 |

---

## Running the Application

Open **three separate terminals** and run each service:

### Terminal 1: Start Backend Server

```powershell
cd CardioShield-AI/server
npm run dev
```

Expected output:
```
[Server] http://localhost:4500
[AI Backend] http://localhost:5001
[DB] Connected
[Cloudinary] Connected
```

### Terminal 2: Start AI Backend

```powershell
cd CardioShield-AI/ai-backend
.\.venv\Scripts\Activate.ps1
python app.py
```

Expected output:
```
[Loading Models]
    ✓ XGBoost loaded
    ✓ TabNet loaded
    ✓ NN loaded
    ✓ Ensemble loaded
    ✓ Scaler loaded
 * Running on http://localhost:5001
```

### Terminal 3: Start Frontend

```powershell
cd CardioShield-AI/client
npm run dev
```

Expected output:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

---

## API Documentation

### Server API Endpoints

Base URL: `http://localhost:4500`

#### Authentication Routes (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/logout` | Logout user | No |

**Register Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Login Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

---

#### User Routes (`/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user/profile` | Get user profile | Yes |
| PUT | `/user/update` | Update user profile | Yes |
| PUT | `/user/deactivate` | Deactivate account | Yes |

---

#### Assessment Routes (`/assessment`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/assessment/save` | Save risk assessment | Yes |
| GET | `/assessment/history` | Get assessment history | Yes |
| GET | `/assessment/latest` | Get latest assessment | Yes |
| GET | `/assessment/stats` | Get user statistics | Yes |
| GET | `/assessment/messages` | Get user messages | Yes |
| PUT | `/assessment/messages/:messageId/read` | Mark message as read | Yes |

**Save Assessment Request Body:**
```json
{
  "patientData": {
    "age": 55,
    "gender": 2,
    "height": 175,
    "weight": 80,
    "ap_hi": 130,
    "ap_lo": 85,
    "cholesterol": 2,
    "gluc": 1,
    "smoke": 0,
    "alco": 0,
    "active": 1
  },
  "result": {
    "risk_level": "Moderate",
    "probability": 0.45
  }
}
```

---

#### Admin Routes (`/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/contacts` | Get all contact queries | Admin |
| PUT | `/admin/contacts/:Qid` | Update contact query | Admin |
| GET | `/admin/ai/dashboard` | Get dashboard stats | Admin |
| GET | `/admin/ai/assessments` | Get all assessments | Admin |
| GET | `/admin/ai/assessments/export` | Export assessments CSV | Admin |
| GET | `/admin/ai/high-risk` | Get high-risk users | Admin |
| GET | `/admin/ai/user/:userId/history` | Get user's assessment history | Admin |
| POST | `/admin/ai/message` | Send message to user | Admin |
| GET | `/admin/ai/messages` | Get admin messages | Admin |
| GET | `/admin/users` | Get all users | Admin |
| PUT | `/admin/users/:userId/toggle` | Toggle user status | Admin |
| DELETE | `/admin/users/:userId` | Delete user | Admin |
| GET | `/admin/analytics` | Get analytics data | Admin |

---

#### Public Routes (`/public`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/public/contactus` | Submit contact form | No |

**Contact Us Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry about CardioShield",
  "message": "I would like to know more about..."
}
```

---

### AI Backend Endpoints

Base URL: `http://localhost:5001`

> **Note:** AI endpoints are also proxied through the main server at `/ai/*`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check & model status |
| POST | `/predict` | Quick prediction (XGBoost) |
| POST | `/assess` | Full multi-model assessment |
| GET | `/metrics` | Model performance metrics |
| GET | `/fairness` | Fairness analysis data |
| POST | `/explain` | Feature importance explanation |

---

#### GET `/health`

Returns service health and loaded model status.

**Response:**
```json
{
  "status": "healthy",
  "service": "CardioShield AI",
  "version": "2.1.0",
  "models": {
    "lightgbm": true,
    "xgboost": true,
    "tabnet": true,
    "neural_network": true,
    "ensemble": true
  },
  "timestamp": "2026-02-24T10:30:00.000Z"
}
```

---

#### POST `/predict`

Quick prediction using XGBoost model.

**Request Body (Option 1 - Array):**
```json
{
  "input": [55, 2, 175, 80, 130, 85, 2, 1, 0, 0, 1]
}
```

Input array order: `[age, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active]`

**Request Body (Option 2 - Object):**
```json
{
  "patientData": {
    "age": 55,
    "gender": 2,
    "height": 175,
    "weight": 80,
    "ap_hi": 130,
    "ap_lo": 85,
    "cholesterol": 2,
    "gluc": 1,
    "smoke": 0,
    "alco": 0,
    "active": 1
  }
}
```

**Response:**
```json
{
  "prediction": 1,
  "probability": {
    "disease": 0.6523,
    "no_disease": 0.3477
  },
  "risk_level": "High",
  "confidence": 0.6523,
  "feature_importance": {
    "Systolic BP": 0.152,
    "Age (Years)": 0.134,
    "Weight": 0.098
  },
  "model_type": "XGBoost",
  "dataset": "Cardiovascular Disease (70,000 records)"
}
```

---

#### POST `/assess`

Comprehensive assessment using all 5 ML models.

**Request Body:**
```json
{
  "patientData": {
    "age": 55,
    "gender": 2,
    "height": 175,
    "weight": 80,
    "ap_hi": 130,
    "ap_lo": 85,
    "cholesterol": 2,
    "gluc": 1,
    "smoke": 0,
    "alco": 0,
    "active": 1
  }
}
```

**Response:**
```json
{
  "assessment_id": "CA-20260224103000",
  "timestamp": "2026-02-24T10:30:00.000Z",
  "patient_summary": {
    "age": 55,
    "gender": "Male",
    "height": "175 cm",
    "weight": "80 kg",
    "bmi": 26.1,
    "blood_pressure": "130/85 mmHg",
    "cholesterol": "Above Normal",
    "glucose": "Normal",
    "smoking": "No",
    "alcohol": "No",
    "active": "Yes"
  },
  "predictions": {
    "XGBoost": {
      "prediction": "High Risk",
      "probability": 0.6523,
      "model_type": "XGBoost (70K Cardio Dataset)"
    },
    "TabNet": {
      "prediction": "High Risk",
      "probability": 0.6234,
      "model_type": "TabNet (70K Cardio Dataset)"
    },
    "NeuralNetwork": {
      "prediction": "Moderate Risk",
      "probability": 0.5891,
      "model_type": "Neural Network (70K Cardio Dataset)"
    }
  },
  "ensemble_result": {
    "prediction": "High Risk",
    "probability": 0.6216,
    "confidence": 0.6216,
    "risk_level": "High",
    "model_agreement": "3/3 models agree"
  },
  "feature_importance": {
    "Systolic BP": 0.152,
    "Age (Years)": 0.134,
    "BMI": 0.112
  },
  "risk_factors": [
    "Elevated blood pressure (130/85 mmHg)",
    "Above normal cholesterol",
    "Overweight (BMI: 26.1)"
  ],
  "recommendations": [
    {
      "priority": "high",
      "category": "Blood Pressure",
      "text": "Monitor blood pressure daily and reduce sodium intake"
    },
    {
      "priority": "medium",
      "category": "Cholesterol",
      "text": "Cholesterol is above normal. Monitor and adjust diet."
    }
  ]
}
```

---

#### GET `/metrics`

Returns model performance metrics.

**Response:**
```json
{
  "accuracy": 0.92,
  "precision": 0.87,
  "recall": 0.91,
  "f1": 0.89,
  "auc": 0.94,
  "pr_auc": 0.89,
  "threshold": 0.50,
  "models": {
    "StackedEnsemble": {
      "accuracy": 0.92,
      "precision": 0.87,
      "recall": 0.91,
      "f1": 0.89,
      "auc": 0.94,
      "pr_auc": 0.89,
      "dataset": "Cardiovascular Disease (70K)"
    },
    "XGBoost": {
      "accuracy": 0.90,
      "precision": 0.85,
      "recall": 0.88,
      "f1": 0.86,
      "auc": 0.93,
      "pr_auc": 0.87,
      "dataset": "Cardiovascular Disease (70K)"
    },
    "LightGBM": {
      "accuracy": 0.89,
      "precision": 0.84,
      "recall": 0.87,
      "f1": 0.85,
      "auc": 0.92,
      "pr_auc": 0.86,
      "dataset": "Cardiovascular Disease (70K)"
    },
    "TabNet": {
      "accuracy": 0.88,
      "precision": 0.83,
      "recall": 0.86,
      "f1": 0.84,
      "auc": 0.92,
      "pr_auc": 0.85,
      "dataset": "Cardiovascular Disease (70K)"
    },
    "NeuralNetwork": {
      "accuracy": 0.87,
      "precision": 0.82,
      "recall": 0.85,
      "f1": 0.83,
      "auc": 0.91,
      "pr_auc": 0.84,
      "dataset": "Cardiovascular Disease (70K)"
    }
  },
  "best_model": "StackedEnsemble",
  "total_models": 5,
  "training_records": 70000,
  "version": "3.1.0"
}
```

---

#### GET `/fairness`

Returns fairness analysis across demographic groups.

**Response:**
```json
{
  "summary": {
    "fairness_score": 0.91,
    "dataset_size": 70000,
    "model": "XGBoost",
    "overall_message": "The model shows minimal bias across demographic groups"
  },
  "analyses": [
    {
      "feature": "gender",
      "groups": [
        {
          "group_label": "Female (1)",
          "count": 45696,
          "positive_rate": 0.49,
          "auc": 0.73
        },
        {
          "group_label": "Male (2)",
          "count": 24304,
          "positive_rate": 0.51,
          "auc": 0.74
        }
      ],
      "auc_disparity": 0.01
    }
  ]
}
```

---

#### POST `/explain`

Returns feature importance explanation for a specific patient.

**Request Body:**
```json
{
  "patientData": {
    "age": 55,
    "gender": 2,
    "height": 175,
    "weight": 80,
    "ap_hi": 130,
    "ap_lo": 85,
    "cholesterol": 2,
    "gluc": 1,
    "smoke": 0,
    "alco": 0,
    "active": 1
  }
}
```

**Response:**
```json
{
  "feature_importance": {
    "Systolic BP": 0.152,
    "Age (Years)": 0.134,
    "BMI": 0.112,
    "Weight": 0.098
  },
  "top_factors": [
    "High blood pressure significantly increases risk",
    "Age is a major contributing factor"
  ]
}
```

---

### Patient Data Input Fields Reference

| Field | Type | Description | Valid Values |
|-------|------|-------------|--------------|
| `age` | int | Age in years | 18-100 |
| `gender` | int | Gender | 1 = Female, 2 = Male |
| `height` | float | Height in cm | 100-250 |
| `weight` | float | Weight in kg | 30-200 |
| `ap_hi` | int | Systolic blood pressure | 80-250 |
| `ap_lo` | int | Diastolic blood pressure | 40-150 |
| `cholesterol` | int | Cholesterol level | 1 = Normal, 2 = Above Normal, 3 = Well Above Normal |
| `gluc` | int | Glucose level | 1 = Normal, 2 = Above Normal, 3 = Well Above Normal |
| `smoke` | int | Smoking status | 0 = No, 1 = Yes |
| `alco` | int | Alcohol consumption | 0 = No, 1 = Yes |
| `active` | int | Physical activity | 0 = No, 1 = Yes |

---

## Default Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend Server | 4500 | http://localhost:4500 |
| AI Backend | 5001 | http://localhost:5001 |
| MongoDB | 27017 | mongodb://localhost:27017 |

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: MongoServerSelectionError: connection timed out
```
**Solution:** Ensure MongoDB is running or check your `MONGO_URI` in `.env`

#### 2. AI Models Not Found
```
Error: XGBoost model not loaded
```
**Solution:** Run `python train_models.py` in the ai-backend directory

#### 3. Python Virtual Environment Issues (Windows)
```
Error: cannot be loaded because running scripts is disabled
```
**Solution:** Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 4. Port Already in Use
```
Error: EADDRINUSE: address already in use :::4500
```
**Solution:** Kill the process using the port:
```powershell
netstat -ano | findstr :4500
taskkill /PID <PID> /F
```

#### 5. CORS Errors
Ensure all three services are running and the allowed origins in both backend servers include your frontend URL.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Dataset: [Cardiovascular Disease Dataset](https://www.kaggle.com/datasets/sulianova/cardiovascular-disease-dataset) (70,000 records)
- ML Models: XGBoost, LightGBM, TabNet, scikit-learn

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
