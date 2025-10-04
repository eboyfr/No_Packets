
const fs = require('fs');
const path = require('path'); 
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Verify API key
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('❌ GOOGLE_MAPS_API_KEY environment variable is not set');
  process.exit(1);
}

// Fetch full Geocoding response
async function geocode(address) {
  const { data } = await axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json',
    { params: { address, key: API_KEY } }
  );
  if (!data.results.length) throw new Error('No results for address');
  return data;
}

// Update .env with new variables
function updateEnv(vars) {
  const envPath = path.resolve(__dirname, '.env');
  const lines = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    : [];
  const map = Object.fromEntries(lines.filter(Boolean).map(l => l.split('=')));
  Object.assign(map, vars);
  fs.writeFileSync(
    envPath,
    Object.entries(map).map(([k, v]) => `${k}=${v}`).join('\n') + '\n',
    'utf8'
  );
}

// Main logic
(async () => {
  const address = process.argv[2] ||
    '1600 Amphitheatre Parkway, Mountain View, CA';
  try {
    const data = await geocode(address);

    // Write the raw JSON response
    const outPath = path.resolve(__dirname, 'coordinates.json');
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Wrote full response to ${outPath}`);

    // Extract lat/lng and update .env
    const { lat, lng } = data.results[0].geometry.location;
    updateEnv({ DEFAULT_LAT: lat, DEFAULT_LNG: lng });
    console.log(`Lat: ${lat}, Lng: ${lng} → exported and saved to .env`);
  } catch (err) {
    console.error('❌ Geocoding failed:', err.message);
    process.exit(1);
  }
})();
