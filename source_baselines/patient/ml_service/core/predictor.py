import os
import joblib
import pandas as pd
from typing import Dict, Any

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "disease_model.joblib")

DISEASE_KEYS = ["anemia", "diabetes", "kidney_dysfunction", "infection"]
FEATURE_KEYS = ["hemoglobin", "wbc_count", "glucose_fasting", "creatinine", "platelets"]

def load_model():
    if os.path.exists(MODEL_PATH):
        try:
            return joblib.load(MODEL_PATH)
        except Exception as e:
            print(f"Failed to load model from {MODEL_PATH}: {e}")
    return None

# Load model on module import if available
model = load_model()

def predict_risks(parameters: Dict[str, Any]) -> Dict[str, float]:
    """
    Predicts disease risk probabilities for a given set of blood report parameters.
    Returns dictionary mapping disease keys to risk probabilities (0.0 - 1.0).
    """
    global model
    if model is None:
        model = load_model()
        
    # Baseline physiological averages as default fallbacks for missing markers
    features = {
        "hemoglobin": 14.0,
        "wbc_count": 7000.0,
        "glucose_fasting": 90.0,
        "creatinine": 0.9,
        "platelets": 250000.0
    }
    
    for key in FEATURE_KEYS:
        if key in parameters:
            val = parameters[key].get("value")
            if val is not None:
                try:
                    features[key] = float(val)
                except (ValueError, TypeError):
                    pass
                
    df = pd.DataFrame([features], columns=FEATURE_KEYS)
    probabilities = {}
    
    if model is not None:
        try:
            prob_list = model.predict_proba(df)
            for idx, disease in enumerate(DISEASE_KEYS):
                disease_prob = prob_list[idx][0]
                if len(disease_prob) > 1:
                    probabilities[disease] = round(float(disease_prob[1]), 2)
                else:
                    probabilities[disease] = 0.0
            return probabilities
        except Exception as e:
            print(f"Model inference exception: {e}")
            
    # Deterministic rule-based fallback if model is unbuilt or fails
    hb = features["hemoglobin"]
    wbc = features["wbc_count"]
    glucose = features["glucose_fasting"]
    creat = features["creatinine"]
    
    probabilities["anemia"] = round(min(max((13.5 - hb) / 6.0, 0.05), 0.95) if hb < 12.5 else 0.08, 2)
    probabilities["diabetes"] = round(min(max((glucose - 95.0) / 100.0, 0.05), 0.95) if glucose > 105.0 else 0.06, 2)
    probabilities["kidney_dysfunction"] = round(min(max((creat - 1.0) / 2.0, 0.05), 0.95) if creat > 1.2 else 0.05, 2)
    probabilities["infection"] = round(min(max((wbc - 8000.0) / 10000.0, 0.05), 0.95) if wbc > 10500.0 else 0.07, 2)
    
    return probabilities
