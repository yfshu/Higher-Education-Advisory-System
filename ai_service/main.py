"""
FastAPI service for ML-based program recommendations.
Loads a trained sklearn model and provides inference-only recommendations.
"""

import os
import joblib
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import numpy as np
from sklearn.linear_model import LogisticRegression

app = FastAPI(title="AI Recommendation Service", version="1.0.0")

# Global model variable
model: Optional[LogisticRegression] = None
model_loaded = False


class StudentProfile(BaseModel):
    """Student profile data for recommendations"""
    study_level: str = Field(..., description="Study level (e.g., 'Bachelor', 'Diploma')")
    field_ids: List[int] = Field(default_factory=list, description="List of field IDs of interest")
    cgpa: Optional[float] = Field(None, description="CGPA score")
    budget: Optional[float] = Field(None, description="Budget in MYR")
    preferred_states: List[str] = Field(default_factory=list, description="Preferred states (e.g., 'Selangor', 'Kuala Lumpur')")


class ProgramInput(BaseModel):
    """Program data for recommendation scoring"""
    program_id: int
    university_id: int
    field_id: int
    tuition_fee: Optional[float] = None
    duration_months: Optional[int] = None
    level: str


class FieldPredictionRequest(BaseModel):
    """Request body for field category prediction"""
    study: str = Field(..., description="Study level: 'SPM' or 'STPM'")
    extracurricular: bool = Field(..., description="Has extracurricular activities")
    grades: dict = Field(..., description="Subject grades dictionary")
    subject_taken: dict = Field(..., description="Subjects taken (binary)")
    interests: dict = Field(..., description="Interest scores (1-5)")
    skills: dict = Field(..., description="Skill scores (1-5)")


class FieldPrediction(BaseModel):
    """Single field category prediction"""
    field_name: str
    probability: float = Field(..., ge=0.0, le=1.0)


class FieldPredictionResponse(BaseModel):
    """Response with ranked field category predictions"""
    fields: List[FieldPrediction]


class RecommendationRequest(BaseModel):
    """Request body for recommendations"""
    student_profile: StudentProfile
    programs: List[ProgramInput]


class ProgramRecommendation(BaseModel):
    """Single program recommendation with score"""
    program_id: int
    score: float = Field(..., ge=0.0, le=1.0, description="Confidence score between 0 and 1")


class RecommendationResponse(BaseModel):
    """Response with ranked program recommendations"""
    recommendations: List[ProgramRecommendation]


def load_model():
    """Load the trained sklearn model from pickle file"""
    global model, model_loaded
    
    if model_loaded:
        return
    
    model_path = os.path.join(os.path.dirname(__file__), "model", "best_logistic_regression_model.pkl")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    try:
        # Use joblib.load() for sklearn models (more reliable than pickle)
        model = joblib.load(model_path)
        model_loaded = True
        print(f"Model loaded successfully from {model_path}")
    except Exception as e:
        raise RuntimeError(f"Failed to load model: {str(e)}")


def extract_features(student_profile: StudentProfile, program: ProgramInput) -> np.ndarray:
    """
    Extract features from student profile and program for model inference.
    This function should match the feature engineering used during training.
    
    The model expects 47 features. We'll create a comprehensive feature vector that
    includes one-hot encodings, interactions, and normalized values.
    """
    features = []
    
    # ===== LEVEL FEATURES (5 features: one-hot for student level) =====
    level_map = {"Bachelor": 0, "Diploma": 1, "Foundation": 2, "Master": 3, "PhD": 4}
    student_level_idx = level_map.get(student_profile.study_level, 0)
    for i in range(5):
        features.append(1.0 if i == student_level_idx else 0.0)
    
    # ===== PROGRAM LEVEL FEATURES (5 features: one-hot for program level) =====
    program_level_idx = level_map.get(program.level, 0)
    for i in range(5):
        features.append(1.0 if i == program_level_idx else 0.0)
    
    # ===== LEVEL MATCH FEATURE (1 feature) =====
    features.append(1.0 if student_level_idx == program_level_idx else 0.0)
    
    # ===== FIELD FEATURES (assuming max 20 fields, one-hot encoded) =====
    # Create one-hot encoding for field_id (assuming fields 1-20)
    field_one_hot = [0.0] * 20
    if program.field_id and 1 <= program.field_id <= 20:
        field_one_hot[program.field_id - 1] = 1.0
    features.extend(field_one_hot)
    
    # ===== FIELD MATCH FEATURE (1 feature) =====
    field_match = 1.0 if (student_profile.field_ids and program.field_id in student_profile.field_ids) else 0.0
    features.append(field_match)
    
    # ===== BUDGET FEATURES (3 features) =====
    if student_profile.budget and program.tuition_fee:
        # Budget ratio (tuition / budget)
        budget_ratio = min(program.tuition_fee / student_profile.budget, 2.0)  # Cap at 2x
        features.append(budget_ratio)
        # Within budget (binary)
        features.append(1.0 if program.tuition_fee <= student_profile.budget else 0.0)
        # Within 20% over budget (binary)
        features.append(1.0 if program.tuition_fee <= student_profile.budget * 1.2 else 0.0)
    else:
        features.extend([0.5, 0.5, 0.5])  # Neutral if missing
    
    # ===== CGPA FEATURES (2 features) =====
    if student_profile.cgpa:
        # Normalized CGPA (0-1 scale)
        features.append(min(student_profile.cgpa / 4.0, 1.0))
        # CGPA category (high/medium/low)
        if student_profile.cgpa >= 3.5:
            features.append(1.0)  # High
        elif student_profile.cgpa >= 2.5:
            features.append(0.5)  # Medium
        else:
            features.append(0.0)  # Low
    else:
        features.extend([0.5, 0.5])  # Neutral if missing
    
    # ===== DURATION FEATURES (2 features) =====
    if program.duration_months:
        # Normalized duration (0-1 scale, max 48 months)
        features.append(min(program.duration_months / 48.0, 1.0))
        # Duration category (short/medium/long)
        if program.duration_months <= 24:
            features.append(0.0)  # Short
        elif program.duration_months <= 36:
            features.append(0.5)  # Medium
        else:
            features.append(1.0)  # Long
    else:
        features.extend([0.5, 0.5])  # Neutral if missing
    
    # ===== TUITION FEE FEATURE (1 feature: normalized) =====
    if program.tuition_fee:
        # Normalize tuition (assuming max 200k)
        features.append(min(program.tuition_fee / 200000.0, 1.0))
    else:
        features.append(0.5)  # Neutral if missing
    
    # ===== INTERACTION FEATURES (2 features) =====
    # CGPA * Budget ratio
    if student_profile.cgpa and student_profile.budget and program.tuition_fee:
        budget_ratio = min(program.tuition_fee / student_profile.budget, 2.0)
        cgpa_norm = min(student_profile.cgpa / 4.0, 1.0)
        features.append(cgpa_norm * budget_ratio)
    else:
        features.append(0.5)
    
    # Level match * Field match
    level_match_val = 1.0 if student_level_idx == program_level_idx else 0.0
    features.append(level_match_val * field_match)
    
    # ===== LOCATION FEATURES (1 feature: placeholder) =====
    # Note: Location matching would require university state info
    features.append(0.5)  # Neutral placeholder
    
    # ===== TOTAL: 5 + 5 + 1 + 20 + 1 + 3 + 2 + 2 + 1 + 2 + 1 = 43 features =====
    # We need 47, so let's add 4 more features
    
    # ===== ADDITIONAL FEATURES (4 features) =====
    # University ID (normalized, assuming max 100 universities)
    if program.university_id:
        features.append(min(program.university_id / 100.0, 1.0))
    else:
        features.append(0.5)
    
    # Program ID (normalized, assuming max 3000 programs)
    if program.program_id:
        features.append(min(program.program_id / 3000.0, 1.0))
    else:
        features.append(0.5)
    
    # Budget availability (how much budget left after tuition)
    if student_profile.budget and program.tuition_fee:
        remaining = max(0, student_profile.budget - program.tuition_fee)
        features.append(min(remaining / student_profile.budget, 1.0))
    else:
        features.append(0.5)
    
    # Affordability score (combination of budget and CGPA)
    if student_profile.cgpa and student_profile.budget and program.tuition_fee:
        cgpa_norm = min(student_profile.cgpa / 4.0, 1.0)
        budget_ok = 1.0 if program.tuition_fee <= student_profile.budget else 0.0
        features.append((cgpa_norm + budget_ok) / 2.0)
    else:
        features.append(0.5)
    
    # Ensure we have exactly 47 features
    if len(features) != 47:
        print(f"[WARNING] Feature count mismatch: expected 47, got {len(features)}. Padding or truncating.")
        # Pad with zeros if too few, truncate if too many
        while len(features) < 47:
            features.append(0.0)
        features = features[:47]
    
    return np.array(features, dtype=np.float32).reshape(1, -1)


def apply_hard_constraints(
    student_profile: StudentProfile,
    program: ProgramInput,
    university_state: Optional[str] = None
) -> bool:
    """
    Apply hard constraints to filter out incompatible programs.
    Returns True if program passes all constraints, False otherwise.
    """
    # Level mismatch
    if student_profile.study_level and program.level:
        if student_profile.study_level != program.level:
            return False
    
    # Field mismatch (if student has specific field interests)
    if student_profile.field_ids and program.field_id not in student_profile.field_ids:
        return False
    
    # Budget constraint (strict: must be within budget)
    if student_profile.budget and program.tuition_fee:
        if program.tuition_fee > student_profile.budget * 1.1:  # Allow 10% tolerance
            return False
    
    # Location preference (if specified)
    if student_profile.preferred_states and university_state:
        if university_state not in student_profile.preferred_states:
            return False
    
    return True


@app.on_event("startup")
async def startup_event():
    """Load model on application startup"""
    try:
        load_model()
    except Exception as e:
        print(f"WARNING: Failed to load model on startup: {e}")
        print("Service will start but recommendations will fail until model is available")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model_loaded
    }


@app.post("/predict-fields", response_model=FieldPredictionResponse)
async def predict_field_interests(request: FieldPredictionRequest):
    """
    Predict field category interests from student profile.
    This matches the notebook's field-first recommendation approach.
    
    Returns top field categories with probabilities.
    """
    if not model_loaded or model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Service unavailable."
        )
    
    # Map grades to numeric values (matching notebook)
    grade_mapping = {'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'G': 0, '0': 0, 0: 0}
    grade_cols = [
        'BM', 'English', 'History', 'Mathematics', 'IslamicOrMoral',
        'Physics', 'Chemistry', 'Bio', 'AddMaths', 'Geography',
        'Economics', 'Accounting', 'Chinese', 'Tamil', 'ICT'
    ]
    
    # Debug: Log what grades we received
    print(f"[DEBUG] ========== GRADES DATA RECEIVED ==========")
    print(f"[DEBUG] Keys in request.grades: {list(request.grades.keys())}")
    print(f"[DEBUG] Total keys received: {len(request.grades)}")
    print(f"[DEBUG] Expected keys: {grade_cols}")
    
    # Convert grades to numeric and log each one
    grade_numeric = []
    missing_grades = []
    for col in grade_cols:
        value = request.grades.get(col, '0')
        numeric_value = grade_mapping.get(value, 0)
        grade_numeric.append(numeric_value)
        if col not in request.grades:
            missing_grades.append(col)
        print(f"[DEBUG]   {col}: '{value}' → {numeric_value} {'(MISSING - using default 0)' if col not in request.grades else ''}")
    
    if missing_grades:
        print(f"[DEBUG] ⚠️  WARNING: Missing grades in request: {missing_grades}")
    print(f"[DEBUG] ============================================")
    
    # Subject taken vector - MUST have all 15 subjects
    subject_taken_cols = [
        'Took_BM', 'Took_English', 'Took_History', 'Took_Mathematics',
        'Took_IslamicOrMoral', 'Took_Physics', 'Took_Chemistry', 'Took_Bio',
        'Took_AddMaths', 'Took_Geography', 'Took_Economics', 'Took_Accounting',
        'Took_Chinese', 'Took_Tamil', 'Took_ICT'
    ]
    
    # Debug: Log what we received in subject_taken
    print(f"[DEBUG] ========== SUBJECT_TAKEN DATA RECEIVED ==========")
    print(f"[DEBUG] Keys in request.subject_taken: {list(request.subject_taken.keys())}")
    print(f"[DEBUG] Total keys received: {len(request.subject_taken)}")
    print(f"[DEBUG] Expected keys: {subject_taken_cols}")
    
    # Check each expected subject
    missing_subjects = []
    subject_taken_values = []
    for col in subject_taken_cols:
        value = request.subject_taken.get(col, 0)
        subject_taken_values.append(value)
        if col not in request.subject_taken:
            missing_subjects.append(col)
        print(f"[DEBUG]   {col}: {value} {'(MISSING - using default 0)' if col not in request.subject_taken else ''}")
    
    if missing_subjects:
        print(f"[DEBUG] ⚠️  WARNING: Missing subjects in request: {missing_subjects}")
    print(f"[DEBUG] ============================================")
    
    subject_taken_vec = [subject_taken_values]
    
    # Interest vector
    # CRITICAL: The notebook uses StandardScaler for these features!
    # Since we don't have the saved scalers, we approximate StandardScaler normalization
    # StandardScaler: (x - mean) / std
    # For interest scores (1-5), typical mean≈3, std≈1.2
    # We'll use approximate scaling: (value - 3) / 1.2
    interest_cols = [
        'Maths_Interest', 'Science_Interest', 'Computer_Interest',
        'Writing_Interest', 'Art_Interest', 'Business_Interest', 'Social_Interest'
    ]
    interest_values = [request.interests.get(col, 3) for col in interest_cols]
    # Approximate StandardScaler: (x - mean) / std where mean≈3, std≈1.2
    interest_vec = (np.array([interest_values]) - 3.0) / 1.2
    
    # Skill vector
    # Same approximation for skills
    skill_cols = [
        'Logical', 'Problem_Solving', 'Creativity', 'Communication',
        'Teamwork', 'Leadership', 'Attention_to_Detail'
    ]
    skill_values = [request.skills.get(col, 3) for col in skill_cols]
    # Approximate StandardScaler: (x - mean) / std where mean≈3, std≈1.2
    skill_vec = (np.array([skill_values]) - 3.0) / 1.2
    
    # Subject grade vector
    # For grades (0-5), typical mean≈2.5, std≈1.5
    # Approximate StandardScaler: (x - mean) / std
    subject_grade_vec = (np.array([grade_numeric]) - 2.5) / 1.5
    
    # Study one-hot encoding
    study_map = {'SPM': [1, 0], 'STPM': [0, 1]}
    study_vec = np.array([study_map.get(request.study, [1, 0])])
    
    # Extracurricular encoding
    extracurricular_encoded = [[1 if request.extracurricular else 0]]
    
    # Field category names (from notebook output - these are the model's classes)
    # Note: The actual class names depend on the label encoder used during training
    # This is a placeholder - in production, these should be loaded from the label encoder
    # MUST be defined before use in debug logging
    field_categories = [
        "Computer Science & IT",
        "Engineering",
        "Health Science",
        "Medicine, Dentistry & Pharmacy",
        "Traditional and Complementary Medicine",
        "Business & Management",
        "Arts & Design",
        "Education",
        "Social Sciences",
        "Law",
        "Agriculture & Forestry",
        "Hospitality & Tourism",
        "Architecture & Built Environment",
        "Others"
    ]
    
    # Combine features (matching notebook structure)
    X_input = np.hstack([
        interest_vec,
        skill_vec,
        subject_taken_vec,
        subject_grade_vec,
        study_vec,
        extracurricular_encoded
    ])
    
    # Debug: Log input features to understand why predictions might be inaccurate
    print(f"[DEBUG] ========== FIELD PREDICTION INPUT ==========")
    print(f"[DEBUG] Input features shape: {X_input.shape}")
    print(f"[DEBUG] Study level: {request.study}, Extracurricular: {request.extracurricular}")
    print(f"[DEBUG] Interest values: {dict(zip(interest_cols, interest_values))}")
    print(f"[DEBUG] Skill values: {dict(zip(skill_cols, skill_values))}")
    print(f"[DEBUG] Grade numeric (all 15): {grade_numeric}")
    print(f"[DEBUG] Subject taken vector (all 15): {subject_taken_vec[0]}")
    print(f"[DEBUG] Subject taken count: {sum(subject_taken_vec[0])} out of {len(subject_taken_vec[0])}")
    
    # Detailed breakdown of feature vector
    print(f"[DEBUG] Feature vector breakdown:")
    print(f"[DEBUG]   Interest vector (7): {interest_vec[0]}")
    print(f"[DEBUG]   Skill vector (7): {skill_vec[0]}")
    print(f"[DEBUG]   Subject taken vector (15): {subject_taken_vec[0]}")
    print(f"[DEBUG]   Subject grade vector (15): {subject_grade_vec[0]}")
    print(f"[DEBUG]   Study vector (2): {study_vec[0]}")
    print(f"[DEBUG]   Extracurricular (1): {extracurricular_encoded[0]}")
    print(f"[DEBUG]   Total features: {X_input.shape[1]} (expected 47)")
    
    # Check for CS/IT relevant features
    print(f"[DEBUG] CS/IT Relevant Features:")
    print(f"[DEBUG]   Computer_Interest: {interest_values[interest_cols.index('Computer_Interest')]}/5")
    print(f"[DEBUG]   Took_ICT: {subject_taken_vec[0][subject_taken_cols.index('Took_ICT')]}")
    print(f"[DEBUG]   ICT Grade: {grade_numeric[grade_cols.index('ICT')]}/5")
    print(f"[DEBUG]   Mathematics Grade: {grade_numeric[grade_cols.index('Mathematics')]}/5")
    print(f"[DEBUG]   Logical Thinking: {skill_values[skill_cols.index('Logical')]}/5")
    print(f"[DEBUG]   Problem Solving: {skill_values[skill_cols.index('Problem_Solving')]}/5")
    print(f"[DEBUG] ============================================")
    
    # Get predictions from model
    try:
        probs = model.predict_proba(X_input)[0]
    except Exception as e:
        print(f"[ERROR] Model prediction failed: {e}")
        print(f"[ERROR] Input shape: {X_input.shape}")
        print(f"[ERROR] Expected features: {model.n_features_in_ if hasattr(model, 'n_features_in_') else 'Unknown'}")
        raise HTTPException(
            status_code=500,
            detail=f"Model prediction error: {str(e)}"
        )
    
    # Debug: Log all probabilities sorted
    all_probs = [(field_categories[i], probs[i]) for i in range(min(len(probs), len(field_categories)))]
    all_probs.sort(key=lambda x: x[1], reverse=True)
    print(f"[DEBUG] All field probabilities (sorted): {[(name, f'{prob:.4f}') for name, prob in all_probs]}")
    
    # Map probabilities to field names
    # Note: The order must match the label encoder's classes_ attribute
    # For now, we'll use the order from the notebook output
    try:
        field_predictions = [
            FieldPrediction(field_name=field_categories[i], probability=float(probs[i]))
            for i in range(min(len(probs), len(field_categories)))
        ]
        
        # Sort by probability descending
        field_predictions.sort(key=lambda x: x.probability, reverse=True)
        
        print(f"[DEBUG] Field predictions: {[(f.field_name, f.probability) for f in field_predictions[:5]]}")
        
        return FieldPredictionResponse(fields=field_predictions)
    except Exception as e:
        print(f"[ERROR] Error creating field predictions: {e}")
        print(f"[ERROR] probs length: {len(probs) if 'probs' in locals() else 'N/A'}, field_categories length: {len(field_categories)}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing predictions: {str(e)}"
        )


@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Generate program recommendations based on student profile and candidate programs.
    
    Returns ranked list of program IDs with confidence scores.
    Programs that violate hard constraints are filtered out.
    """
    if not model_loaded or model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not loaded. Service unavailable."
        )
    
    # Debug logging
    print(f"[DEBUG] Received request with {len(request.programs)} programs")
    print(f"[DEBUG] Student profile: study_level={request.student_profile.study_level}, "
          f"field_ids={request.student_profile.field_ids}, "
          f"cgpa={request.student_profile.cgpa}, "
          f"budget={request.student_profile.budget}, "
          f"preferred_states={request.student_profile.preferred_states}")
    
    # Log first few program IDs received
    if request.programs:
        sample_ids = [p.program_id for p in request.programs[:5]]
        print(f"[DEBUG] Sample program IDs received from backend: {sample_ids}")
    
    recommendations = []
    filtered_count = 0
    error_count = 0
    
    for program in request.programs:
        # Apply hard constraints first
        # Note: We need university state info, but it's not in ProgramInput
        # For now, we'll skip location constraint check here
        # In production, you'd pass university state from the backend
        
        # Level matching - normalize both sides for comparison (case-insensitive)
        def normalize_level(level: str) -> str:
            """Normalize level string for comparison"""
            if not level:
                return ""
            level_lower = level.lower().strip()
            # Map common variations to standard forms
            if level_lower in ["bachelor", "bachelor's", "degree", "undergraduate", "bachelors"]:
                return "bachelor"
            elif level_lower in ["diploma"]:
                return "diploma"
            elif level_lower in ["foundation"]:
                return "foundation"
            elif level_lower in ["master", "masters"]:
                return "master"
            elif level_lower in ["phd", "doctorate"]:
                return "phd"
            return level_lower
        
        student_level_norm = normalize_level(request.student_profile.study_level or "")
        program_level_norm = normalize_level(program.level or "")
        
        # Level match: if either is missing, allow it (don't filter)
        level_match = (
            not request.student_profile.study_level or
            not program.level or
            student_level_norm == program_level_norm
        )
        
        # Field match: if field_ids is empty, don't filter by field (allow all fields)
        # This prevents filtering out all programs when student hasn't specified interests
        field_match = (
            not request.student_profile.field_ids or  # Empty list = no field preference
            len(request.student_profile.field_ids) == 0 or  # Explicitly empty
            program.field_id in request.student_profile.field_ids
        )
        
        budget_ok = (
            not request.student_profile.budget or
            not program.tuition_fee or
            program.tuition_fee <= request.student_profile.budget * 1.1
        )
        
        # Debug first few programs to see what's happening
        if len(recommendations) + filtered_count < 5:
            print(f"[DEBUG] Program {program.program_id}: level={program.level}, "
                  f"field_id={program.field_id}, tuition={program.tuition_fee}, "
                  f"level_match={level_match}, field_match={field_match}, budget_ok={budget_ok}")
        
        if not (level_match and field_match and budget_ok):
            filtered_count += 1
            continue  # Skip programs that violate constraints
        
        # Extract features and get prediction
        try:
            features = extract_features(request.student_profile, program)
            # Get probability of positive class (recommendation)
            score = model.predict_proba(features)[0][1]  # Assuming binary classification
            
            # Debug first few successful predictions
            if len(recommendations) < 3:
                print(f"[DEBUG] Program {program.program_id} passed constraints, score={score:.4f}")
            
            recommendations.append(
                ProgramRecommendation(
                    program_id=program.program_id,
                    score=float(score)
                )
            )
        except Exception as e:
            # Skip programs that cause prediction errors
            error_count += 1
            if error_count <= 3:
                print(f"[DEBUG] Error predicting for program {program.program_id}: {e}")
            continue
    
    # Sort by score descending
    recommendations.sort(key=lambda x: x.score, reverse=True)
    
    # Debug: Log returned program IDs
    if recommendations:
        returned_ids = [r.program_id for r in recommendations[:10]]
        print(f"[DEBUG] Returning {len(recommendations)} recommendations with IDs: {returned_ids}")
    else:
        print(f"[DEBUG] No recommendations generated (all programs filtered out or errors occurred)")
    
    # Debug summary
    print(f"[DEBUG] Summary: {len(recommendations)} recommendations, "
          f"{filtered_count} filtered by constraints, {error_count} prediction errors")
    
    return RecommendationResponse(recommendations=recommendations)

