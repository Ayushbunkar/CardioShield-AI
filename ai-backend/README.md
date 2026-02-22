# CardioShield AI Backend

Heart Disease Prediction API using LightGBM.

## Setup

```bash
pip install -r requirements.txt
python app.py
```

Server runs at `http://localhost:5001`

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/predict` | Quick prediction (13 UCI features) |
| POST | `/assess` | Full assessment with recommendations |
| GET | `/metrics` | Model performance |
| GET | `/fairness` | Fairness analysis |
| POST | `/explain` | Feature importance |

## Input Format

POST `/predict` or `/assess`:
```json
{
  "input": [age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]
}
```

## Example

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{"input": [63, 1, 3, 145, 233, 1, 0, 150, 0, 2.3, 0, 0, 1]}'
```

## Project Structure

```
ai-backend/
├── app.py              # Flask API
├── requirements.txt    # Dependencies
├── README.md           # This file
└── models/
    └── heart_disease_predictor.pk2  # LightGBM model
```
