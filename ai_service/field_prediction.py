"""
Field category prediction using the trained ML model.
This matches the notebook's field-first recommendation approach.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import List, Tuple
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder

# Field category names from the notebook (these are the model's output classes)
# Based on the notebook output, these are the 14 field categories
FIELD_CATEGORIES = [
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

# Grade mapping (from notebook)
GRADE_MAPPING = {
    'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'G': 0, '0': 0, 0: 0
}

# Subject columns (from notebook)
GRADE_COLS = [
    'BM', 'English', 'History', 'Mathematics', 'IslamicOrMoral',
    'Physics', 'Chemistry', 'Bio', 'AddMaths', 'Geography',
    'Economics', 'Accounting', 'Chinese', 'Tamil', 'ICT'
]

SUBJECT_TAKEN_COLS = [
    'Took_BM', 'Took_English', 'Took_History', 'Took_Mathematics',
    'Took_IslamicOrMoral', 'Took_Physics', 'Took_Chemistry', 'Took_Bio',
    'Took_AddMaths', 'Took_Geography', 'Took_Economics', 'Took_Accounting',
    'Took_Chinese', 'Took_Tamil', 'Took_ICT'
]

INTEREST_COLS = [
    'Maths_Interest', 'Science_Interest', 'Computer_Interest',
    'Writing_Interest', 'Art_Interest', 'Business_Interest', 'Social_Interest'
]

SKILL_COLS = [
    'Logical', 'Problem_Solving', 'Creativity', 'Communication',
    'Teamwork', 'Leadership', 'Attention_to_Detail'
]

# Global scalers and encoders (would need to be loaded from training artifacts)
# For now, we'll create placeholders - in production, these should be saved/loaded
subject_scaler = StandardScaler()
interest_scaler = StandardScaler()
skill_scaler = StandardScaler()
onehot_encoder = OneHotEncoder(sparse_output=False)
extra_encoder = LabelEncoder()


def predict_field_interests(
    study: str,
    extracurricular: bool,
    grades_dict: dict,
    subject_taken_dict: dict,
    interest_dict: dict,
    skill_dict: dict,
    model,
    top_k: int = 3
) -> List[Tuple[str, float]]:
    """
    Predict field category interests from student profile data.
    This matches the notebook's recommend_from_raw_student_data function.
    
    Returns: List of (field_name, probability) tuples, sorted by probability descending.
    """
    # Convert grades to numeric
    grade_numeric = [GRADE_MAPPING.get(grades_dict.get(col, '0'), 0) for col in GRADE_COLS]
    
    # Prepare subject grade vector (scaled)
    # Note: In production, the scaler should be loaded from training artifacts
    # For now, we'll use a simple normalization
    subject_grade_vec = np.array([grade_numeric]) / 5.0  # Normalize to 0-1
    
    # Subject taken vector
    subject_taken_vec = [[subject_taken_dict.get(col, 0) for col in SUBJECT_TAKEN_COLS]]
    
    # Interest vector (scaled)
    interest_values = [interest_dict.get(col, 3) for col in INTEREST_COLS]  # Default to 3 (neutral)
    interest_vec = np.array([interest_values]) / 5.0  # Normalize to 0-1
    
    # Skill vector (scaled)
    skill_values = [skill_dict.get(col, 3) for col in SKILL_COLS]  # Default to 3 (neutral)
    skill_vec = np.array([skill_values]) / 5.0  # Normalize to 0-1
    
    # Study one-hot encoding
    # Note: In production, the encoder should be loaded from training artifacts
    # For now, we'll create a simple encoding
    study_map = {'SPM': [1, 0], 'STPM': [0, 1]}
    study_vec = np.array([study_map.get(study, [1, 0])])
    
    # Extracurricular encoding
    extracurricular_encoded = [[1 if extracurricular else 0]]
    
    # Combine all features (matching notebook structure)
    X_input = np.hstack([
        interest_vec,
        skill_vec,
        subject_taken_vec,
        subject_grade_vec,
        study_vec,
        extracurricular_encoded
    ])
    
    # Get predictions from model
    probs = model.predict_proba(X_input)[0]
    
    # Map probabilities to field category names
    # The model outputs probabilities for each class in order
    # We need to map them to field category names
    field_probs = list(zip(FIELD_CATEGORIES, probs))
    
    # Sort by probability descending
    field_probs.sort(key=lambda x: x[1], reverse=True)
    
    # Return top K
    return field_probs[:top_k]

