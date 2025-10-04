const path = require('path');
const result = require('dotenv').config({
  path: path.resolve(__dirname, '.env')
});

if (result.error) {
  console.error('❌ Failed to load .env:', result.error);
} else {
  console.log('✅ Loaded .env from', result.parsed);
}

console.log('DEBUG process.cwd():', process.cwd());
console.log('DEBUG __dirname:', __dirname);
console.log('DEBUG Keys with GOOGLE:', 
  Object.keys(process.env).filter(k => k.includes('GOOGLE'))
);

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('❌ GOOGLE_MAPS_API_KEY environment variable is not set');
  process.exit(1);
}


/*require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// 1. Read API key
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY missing in .env');
  process.exit(1);
*/

// 2. Geocode function
async function geocode(address) {
  const { data } = await axios.get(
    'https://maps.googleapis.com/maps/api/geocode/json',
    { params: { address, key: API_KEY } }
  );
  if (!data.results.length) throw new Error('No results for address');
  return data.results[0].geometry.location; // { lat, lng }
}

// 3. Update .env
function updateEnv(vars) {
  const envPath = path.resolve(__dirname, '.env');
  const lines = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    : [];
  const map = Object.fromEntries(lines.filter(Boolean).map(l => l.split('=')));
  Object.assign(map, vars);
  fs.writeFileSync(
    envPath,
    Object.entries(map).map(([k,v]) => `${k}=${v}`).join('\n') + '\n'
  );
}

// 4. Main execution
(async () => {
  const address = process.argv[2] || '1600 Amphitheatre Parkway, Mountain View, CA';
  try {
    const { lat, lng } = await geocode(address);
    process.env.DEFAULT_LAT = String(lat);
    process.env.DEFAULT_LNG = String(lng);
    updateEnv({ DEFAULT_LAT: lat, DEFAULT_LNG: lng });
    console.log(`Lat: ${lat}, Lng: ${lng} → exported and saved to .env`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
})();
