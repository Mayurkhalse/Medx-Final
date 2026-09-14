"""
Script: evaluate.py
Description: Evaluates the trained MultiOutput Random Forest model on test
splits, computing classification reports, precision/recall, and test case predictions.
"""
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "clean_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "disease_model.joblib")

FEATURE_KEYS = ["hemoglobin", "wbc_count", "glucose_fasting", "creatinine", "platelets"]
DISEASE_KEYS = ["anemia", "diabetes", "kidney_dysfunction", "infection"]

def evaluate_model():
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Run train.py first.")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Run clean_data.py first.")
        
    print(f"Loading model from {MODEL_PATH}...")
    model = joblib.load(MODEL_PATH)
    
    print(f"Loading test data from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURE_KEYS]
    y = df[DISEASE_KEYS]
    
    # Use standard test split
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.25, random_state=123)
    
    y_pred = model.predict(X_test)
    prob_list = model.predict_proba(X_test)
    
    print("\n" + "="*60)
    print("        MEDX MODEL EVALUATION REPORT")
    print("="*60)
    
    for idx, disease in enumerate(DISEASE_KEYS):
        print(f"\n--- Performance for: {disease.upper()} ---")
        y_true_col = y_test[disease]
        y_pred_col = y_pred[:, idx]
        
        report = classification_report(y_true_col, y_pred_col, target_names=["Negative", "Positive"])
        print(report)
        
        try:
            # Positive class probability
            probs = prob_list[idx][:, 1]
            auc = roc_auc_score(y_true_col, probs)
            print(f"ROC-AUC Score: {auc:.4f}")
        except Exception as e:
            print(f"ROC-AUC could not be computed: {e}")
            
    print("\n" + "="*60)
    print("        CLINICAL TEST SCENARIO PREDICTIONS")
    print("="*60)
    
    scenarios = [
        {"name": "Healthy Baseline", "values": [14.5, 6500, 85, 0.9, 280000]},
        {"name": "Severe Anemia Patient", "values": [7.8, 6200, 88, 0.8, 250000]},
        {"name": "Diabetic Hyperglycemia", "values": [13.8, 7100, 210, 0.95, 270000]},
        {"name": "Renal Impairment", "values": [12.0, 8000, 92, 3.2, 210000]},
        {"name": "Acute Infection (Leukocytosis)", "values": [13.2, 22000, 95, 0.85, 310000]},
    ]
    
    for sc in scenarios:
        test_df = pd.DataFrame([sc["values"]], columns=FEATURE_KEYS)
        probs = model.predict_proba(test_df)
        res = {DISEASE_KEYS[i]: round(float(probs[i][0][1]), 3) for i in range(len(DISEASE_KEYS))}
        print(f"\nScenario: {sc['name']}")
        print(f"Inputs: {dict(zip(FEATURE_KEYS, sc['values']))}")
        print(f"Predicted Risks: {res}")

if __name__ == "__main__":
    evaluate_model()
