import joblib
import numpy as np

model = joblib.load('no_scale.pkl')

# Prepare new input data: list of 10 features
# new_data = np.array([[value1, value2, ..., value10]])

# Predict rainfall
# prediction = model.predict(new_data)
# print("Predicted:", prediction)