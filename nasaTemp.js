// nasaTemp.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

function getCoords() {
  const filePath = path.resolve(__dirname, 'coordinates.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ coordinates.json not found');
    process.exit(1);
  }
  const raw  = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const loc  = data.results?.[0]?.geometry?.location;
  if (!loc) {
    console.error('❌ Invalid coordinates.json format');
    process.exit(1);
  }
  console.log(`🔍 Using coordinates: lat=${loc.lat}, lon=${loc.lng}`);
  return { lat: loc.lat, lon: loc.lng };
}

async function fetchTempRange(lat, lon, start, end) {
  const res = await axios.get(
    'https://power.larc.nasa.gov/api/temporal/daily/point',
    {
      params: {
        parameters: 'T2M',
        community: 'RE',
        latitude: lat,
        longitude: lon,
        start,
        end,
        format: 'JSON',
        api_key: process.env.NASA_API_KEY    // ← here
      }
    }
  );
  return res.data.properties.parameter.T2M;
}

(async () => {
  try {
    const { lat, lon } = getCoords();
    const fmt = d => d.toISOString().slice(0,10).replace(/-/g,'');

    const endDate   = fmt(new Date());
    const startDate = fmt(new Date(new Date().setDate(new Date().getDate() - 6)));
    console.log(`⏳ Fetching T2M from ${startDate} to ${endDate}`);

    const temps = await fetchTempRange(lat, lon, startDate, endDate);
    const entries = Object.entries(temps).sort((a,b) => b[0].localeCompare(a[0]));
    const valid = entries.find(([_, v]) => v !== -999 && v != null);

    if (!valid) {
      console.log(`❌ No valid T2M data in range.`);
    } else {
      console.log(`📅 ${valid[0]} → 🌡️ ${valid[1]}°C`);
    }
  } catch (err) {
    console.error('❌ ERROR fetching temperature:', err.response?.data || err.message);
    process.exit(1);
  }
})();
