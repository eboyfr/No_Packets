import json
import os

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
    temperature_value = 24.0
    rain_value = 10.2
    wind_value = 6.9

    write_weather_json(temperature_value, rain_value, wind_value)
