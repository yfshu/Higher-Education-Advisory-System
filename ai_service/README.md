# AI Recommendation Service

FastAPI service for ML-based program recommendations using a trained sklearn model.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Ensure model file exists:**
   - The model file should be at `model/best_logistic_regression_model.pkl`
   - If missing, the service will start but recommendations will fail

3. **Run the service:**
   ```bash
   python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Or using Docker:
   ```bash
   docker build -t ai-service .
   docker run -p 8000:8000 ai-service
   ```

## API Endpoints

### Health Check
```
GET /health
```

Returns service status and whether the model is loaded.

### Get Recommendations
```
POST /recommend
```

**Request Body:**
```json
{
  "student_profile": {
    "study_level": "Bachelor",
    "field_ids": [1, 3],
    "cgpa": 3.2,
    "budget": 50000,
    "preferred_states": ["Selangor", "Kuala Lumpur"]
  },
  "programs": [
    {
      "program_id": 37,
      "university_id": 5,
      "field_id": 1,
      "tuition_fee": 42000,
      "duration_months": 36,
      "level": "Bachelor"
    }
  ]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "program_id": 37,
      "score": 0.91
    }
  ]
}
```

## Features

- **Hard Constraints**: Filters out programs that violate budget, level, or field requirements
- **ML Scoring**: Uses trained sklearn model to score program compatibility
- **Ranking**: Returns programs sorted by confidence score (descending)

## Environment Variables

None required (model path is hardcoded relative to service directory).

## Notes

- The service performs inference only (no training)
- Feature extraction should match the training pipeline
- Hard constraints are applied before ML scoring
- Programs violating constraints are filtered out completely

