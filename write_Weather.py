import json
import os

import joblib
import numpy as np
import pandas as pd


def write_weather_json(temp, rain, wind, directory='jsonData', filename='weather_data.json'):
    """
    Create a JSON file with temperature, rain, and wind values in the specified directory.

    Args:
        temp (float): Temperature value
        rain (float): Rainfall value
        wind (float): Wind speed value
        directory (str): Directory to save the JSON file
        filename (str): JSON filename
    """
    # Ensure the directory exists
    os.makedirs(directory, exist_ok=True)

    data = {
        "temperature": float(temp),
        "rain": float(rain),
        "wind": float(wind)
    }

    filepath = os.path.join(directory, filename)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Weather data written to '{filepath}'")

if __name__ == '__main__':
    # Load history CSV (ensure correct folder name)
    df = pd.read_csv('jsonData/day_history.csv')
    # Drop the 'parameter' column
    data = df.drop(columns=['parameter'])

    # Extract one-row arrays
    temp_data = data.iloc[[0]].values
    rain_data = data.iloc[[1]].values
    wind_data = data.iloc[[2]].values

    # Load models (ensure filenames match)
    temp_model = joblib.load('temp_model.pkl')
    rain_model = joblib.load('rain_model_2.8.pkl')
    wind_model = joblib.load('wind_model_0.9.pkl')

    # Predict and extract scalars
    temperature_value = float(temp_model.predict(temp_data)[0])
    rain_value        = float(rain_model.predict(rain_data)[0])
    wind_value        = float(wind_model.predict(wind_data)[0])

    # Write JSON
    write_weather_json(temperature_value, rain_value, wind_value,
                       directory='JsonData', filename='weather_data.json')

