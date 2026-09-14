"""
Script: clean_data.py
Description: Ingests raw biomarker CSV, performs validation, imputation,
outlier clipping, and type normalization, saving the clean dataset to CSV.
"""
import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
INPUT_CSV = os.path.join(DATA_DIR, "raw_synthetic_data.csv")
OUTPUT_CSV = os.path.join(DATA_DIR, "clean_data.csv")

FEATURE_COLS = ["hemoglobin", "wbc_count", "glucose_fasting", "creatinine", "platelets"]
TARGET_COLS = ["anemia", "diabetes", "kidney_dysfunction", "infection"]

def clean_dataset(input_path: str, output_path: str):
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found at {input_path}. Please run generate_synthetic_data.py first.")
        
    print(f"Reading raw dataset from: {input_path}")
    df = pd.read_csv(input_path)
    initial_count = len(df)
    
    # 1. Check for duplicates
    df = df.drop_duplicates()
    
    # 2. Check for missing values and impute medians if any
    for col in FEATURE_COLS:
        if df[col].isnull().any():
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            print(f"Imputed missing values in '{col}' with median: {median_val}")
            
    # 3. Ensure targets are binary integer
    for col in TARGET_COLS:
        df[col] = df[col].fillna(0).astype(int)
        df[col] = df[col].clip(0, 1)
        
    # 4. Outlier boundaries verification
    df["hemoglobin"] = df["hemoglobin"].clip(lower=3.0, upper=25.0)
    df["wbc_count"] = df["wbc_count"].clip(lower=500.0, upper=50000.0)
    df["glucose_fasting"] = df["glucose_fasting"].clip(lower=30.0, upper=500.0)
    df["creatinine"] = df["creatinine"].clip(lower=0.1, upper=15.0)
    df["platelets"] = df["platelets"].clip(lower=10000.0, upper=1000000.0)
    
    # Save clean dataset
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Successfully cleaned and saved dataset to: {output_path}")
    print(f"Processed records: {len(df)} (from {initial_count} raw records)")
    print(f"Data types:\n{df.dtypes}")

if __name__ == "__main__":
    clean_dataset(INPUT_CSV, OUTPUT_CSV)
