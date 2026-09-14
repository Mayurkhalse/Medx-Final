"""
Script: generate_synthetic_data.py
Description: Generates synthetic clinical biomarker observations and assigns
multi-disease risk labels based on clinical correlations. Saves raw output to CSV.
"""
import os
import numpy as np
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
OUTPUT_CSV = os.path.join(DATA_DIR, "raw_synthetic_data.csv")

def generate_synthetic_dataset(n_samples: int = 2500, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)
    
    # Feature distributions
    hemoglobin = np.random.normal(14.0, 2.5, n_samples)
    wbc_count = np.random.normal(7500.0, 3000.0, n_samples)
    glucose_fasting = np.random.normal(95.0, 32.0, n_samples)
    creatinine = np.random.normal(0.95, 0.45, n_samples)
    platelets = np.random.normal(280000.0, 75000.0, n_samples)
    
    # Clip to physiologically plausible minimums
    hemoglobin = np.clip(hemoglobin, 4.0, 22.0)
    wbc_count = np.clip(wbc_count, 1000.0, 45000.0)
    glucose_fasting = np.clip(glucose_fasting, 40.0, 450.0)
    creatinine = np.clip(creatinine, 0.2, 12.0)
    platelets = np.clip(platelets, 20000.0, 900000.0)
    
    df = pd.DataFrame({
        "hemoglobin": np.round(hemoglobin, 2),
        "wbc_count": np.round(wbc_count, 1),
        "glucose_fasting": np.round(glucose_fasting, 1),
        "creatinine": np.round(creatinine, 2),
        "platelets": np.round(platelets, 0)
    })
    
    # Disease ground-truth labels based on clinical thresholds with stochastic noise
    noise = np.random.uniform(0, 0.1, n_samples)
    
    # Anemia: low hemoglobin (< 12.5)
    anemia_score = (df["hemoglobin"] < 12.0).astype(float) * 0.85 + (df["hemoglobin"] < 10.0).astype(float) * 0.15 + noise
    df["anemia"] = (anemia_score > 0.5).astype(int)
    
    # Diabetes: elevated fasting glucose (> 125 mg/dL)
    diabetes_score = (df["glucose_fasting"] > 125.0).astype(float) * 0.85 + (df["glucose_fasting"] > 160.0).astype(float) * 0.15 + noise
    df["diabetes"] = (diabetes_score > 0.5).astype(int)
    
    # Kidney Dysfunction: elevated creatinine (> 1.25 mg/dL)
    kidney_score = (df["creatinine"] > 1.25).astype(float) * 0.80 + (df["creatinine"] > 2.0).astype(float) * 0.20 + noise
    df["kidney_dysfunction"] = (kidney_score > 0.5).astype(int)
    
    # Infection / Inflammation: elevated WBC count (> 11000 /uL)
    infection_score = (df["wbc_count"] > 11000.0).astype(float) * 0.80 + (df["wbc_count"] > 15000.0).astype(float) * 0.20 + noise
    df["infection"] = (infection_score > 0.5).astype(int)
    
    return df

def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    print(f"Generating synthetic biomarker dataset...")
    df = generate_synthetic_dataset(n_samples=2500, random_seed=42)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Successfully saved raw synthetic dataset to: {OUTPUT_CSV}")
    print(f"Dataset shape: {df.shape}")
    print("\nSummary Statistics:")
    print(df.describe())
    print("\nTarget Label Distributions:")
    print(df[["anemia", "diabetes", "kidney_dysfunction", "infection"]].mean())

if __name__ == "__main__":
    main()
