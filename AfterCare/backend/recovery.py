import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression


def generate_recovery_data():

    data = pd.read_csv("data.csv")

    # ---- TIMESTAMP ----
    data["timestamp"] = pd.to_datetime(data["timestamp"])
    data = data.sort_values("timestamp")

    # ---- ENSURE NUMERIC ----
    data["heart_rate"] = pd.to_numeric(data["heart_rate"], errors="coerce")
    data["acc_magnitude"] = pd.to_numeric(data["acc_magnitude"], errors="coerce")

    # ---- FAKE SPO2 ----
    np.random.seed(42)
    data["spo2"] = np.random.normal(97,1,len(data))

    # ---- DROP NaNs ----
    data = data.dropna()

    # ---- REGRESSION (expected recovery) ----
    data["time_index"] = np.arange(len(data))

    reg = LinearRegression()
    reg.fit(data[["time_index"]], data["acc_magnitude"])

    data["expected_activity"] = reg.predict(data[["time_index"]])

    # ---- RETURN ----
    return {
        "time": data["timestamp"].astype(str).tolist(),
        "hr": data["heart_rate"].tolist(),
        "spo2": data["spo2"].tolist(),
        "activity": data["acc_magnitude"].tolist(),
        "expected": data["expected_activity"].tolist(),
        "risk": [0]*len(data)
    }