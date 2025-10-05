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
    # Example usage:
    data = pd.read_csv("jsonData/day_history.csv")
    data = data.iloc[:, 1:]

    temp_data = np.array([data.iloc[0]])
    # print(temp_data)
    rain_data = np.array([data.iloc[1]])
    wind_data = np.array([data.iloc[2]])
    # print(os.getcwd())
    temp_model = joblib.load('temp_model.pkl')
    rain_model = joblib.load('rain_model29_2.8.pkl')
    wind_model = joblib.load('wind_model1.5_0.9.pkl')

    temperature_value = temp_model.predict(temp_data)
    rain_value = rain_model.predict(rain_data)
    wind_value = wind_model.predict(wind_data)

    write_weather_json(temperature_value, rain_value, wind_value)
