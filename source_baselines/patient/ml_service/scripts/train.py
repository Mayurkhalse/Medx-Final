"""
Script: train.py
Description: Ingests clean biomarker dataset, trains a MultiOutputClassifier
with balanced Random Forests, and persists the serialized model artifact.
"""
import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "clean_data.csv")
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "disease_model.joblib")

FEATURE_KEYS = ["hemoglobin", "wbc_count", "glucose_fasting", "creatinine", "platelets"]
DISEASE_KEYS = ["anemia", "diabetes", "kidney_dysfunction", "infection"]

def train_model():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Clean dataset not found at {DATA_PATH}. Please run clean_data.py first.")
        
    print(f"Loading clean dataset from {DATA_PATH}...")
    df = pd.read_csv(DATA_PATH)
    
    X = df[FEATURE_KEYS]
    y = df[DISEASE_KEYS]
    
    print(f"Features: {FEATURE_KEYS}")
    print(f"Targets: {DISEASE_KEYS}")
    print(f"Samples count: {len(df)}")
    
    # Train/Validation split
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Random Forest MultiOutputClassifier with balanced weighting
    print("Fitting MultiOutput Random Forest Classifier...")
    base_rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=5,
        class_weight="balanced",
        random_state=42
    )
    clf = MultiOutputClassifier(base_rf, n_jobs=1)
    clf.fit(X_train, y_train)
    
    # Evaluation score on validation set
    train_score = clf.score(X_train, y_train)
    val_score = clf.score(X_val, y_val)
    print(f"Train Exact Match Ratio: {train_score:.4f}")
    print(f"Validation Exact Match Ratio: {val_score:.4f}")
    
    # Persist model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, MODEL_PATH)
    print(f"Successfully serialized model artifact to: {MODEL_PATH}")

if __name__ == "__main__":
    train_model()
