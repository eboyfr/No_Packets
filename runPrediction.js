// runPrediction.js

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// ── CONFIGURATION ────────────────────────────────────────────────────────────
const EXPORT_SCRIPT = path.resolve(__dirname, 'exportSpecificDayHistory.js');
const PYTHON_MODEL  = path.resolve(__dirname, 'write_Weather.py');
const INPUT_CSV     = path.resolve(__dirname, 'jsonData', 'day_history.csv');
const OUTPUT_JSON   = path.resolve(__dirname, 'jsonData', 'weather_data.json');

// ── HELPER: RUN COMMAND WITH LOGGING ─────────────────────────────────────────
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔄 Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options
    });

    child.stdout.on('data', data => process.stdout.write(data.toString()));
    child.stderr.on('data', data => process.stderr.write(data.toString()));

    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with code ${code}`));
    });

    child.on('error', err => reject(err));
  });
}

// ── MAIN PIPELINE ────────────────────────────────────────────────────────────
(async () => {
  try {
    console.log('🚀 Starting prediction pipeline');

    // Step 1: Export historical data
    await runCommand('node', [EXPORT_SCRIPT]);
    console.log('✅ Data export complete');

    // Step 2: Verify input CSV exists
    if (!fs.existsSync(INPUT_CSV)) {
      throw new Error(`Missing input CSV: ${INPUT_CSV}`);
    }

    // Step 3: Run Python AI model to produce JSON output
    await runCommand('python', [PYTHON_MODEL, INPUT_CSV, OUTPUT_JSON]);
    console.log('✅ AI model run complete');

    // Step 4: Verify JSON output exists
    if (!fs.existsSync(OUTPUT_JSON)) {
      throw new Error(`Missing output JSON: ${OUTPUT_JSON}`);
    }

    // Step 5: Load and display predictions
    const raw = fs.readFileSync(OUTPUT_JSON, 'utf8');
    const predictions = JSON.parse(raw);
    console.log('\n🤖 Prediction Results:\n', JSON.stringify(predictions, null, 2));

    console.log('\n🎉 Pipeline completed successfully');
  } catch (err) {
    console.error('\n❌ Pipeline failed:', err.message);
    process.exit(1);
  }
})();
