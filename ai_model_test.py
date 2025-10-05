# ai_model_test.py

import sys, pandas as pd

def main():
    if len(sys.argv) != 3:
        print("Usage: python ai_model_test.py <input_csv> <output_csv>")
        sys.exit(1)

    inp, out = sys.argv[1], sys.argv[2]
    df = pd.read_csv(inp)
    # Simply write back the input shape
    with open(out, 'w') as f:
        f.write(f"rows,cols\n{df.shape[0]},{df.shape[1]}\n")
    print("Test model ran successfully.")

if __name__ == "__main__":
    main()
