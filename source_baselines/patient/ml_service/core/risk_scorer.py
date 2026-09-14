from typing import Dict, Tuple

def calculate_composite_score(flags: Dict[str, str], disease_risks: Dict[str, float]) -> Tuple[int, str]:
    """
    Calculates a composite score (0-100) and risk tier based on flags and disease risks.
    Tier thresholds:
    - 0-35: Low
    - 36-65: Moderate
    - 66-85: High
    - 86-100: Critical
    """
    score = 15.0  # Base score
    
    # Flags weighting
    for param, flag in flags.items():
        if "critical" in flag:
            score += 25.0
        elif flag in ["high", "low"]:
            score += 10.0
            
    # Disease risk weighting: add based on highest risks
    max_risk = max(disease_risks.values()) if disease_risks else 0.0
    score += max_risk * 45.0
    
    # Cap score between 0 and 100
    final_score = min(max(int(score), 0), 100)
    
    # Tiers
    if final_score <= 35:
        tier = "Low"
    elif final_score <= 65:
        tier = "Moderate"
    elif final_score <= 85:
        tier = "High"
    else:
        tier = "Critical"
        
    return final_score, tier
