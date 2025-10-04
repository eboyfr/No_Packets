// exportLocationPivot.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

// ── CONFIGURE DATE RANGE HERE ────────────────────────────────────────────────
const startDate = '20040101';
const endDate   = '20241231';

// ── DERIVE YEARS ─────────────────────────────────────────────────────────────
function ymdToDate(ymd) {
  return new Date(+ymd.slice(0,4), +ymd.slice(4,6) - 1, +ymd.slice(6,8));
}
const start = ymdToDate(startDate);
const end   = ymdToDate(endDate);
const years = [];
for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
  years.push(String(y));
}

// ── LOAD USER DATA ──────────────────────────────────────────────────────────
// JsonData/user_data.json is a single object:
// { "country": "...", "city": "...", "date": "...", "time": "..." }
const userDataPath = path.resolve(__dirname, 'JsonData', 'user_data.json');
if (!fs.existsSync(userDataPath)) {
  console.error('❌ Missing JsonData/user_data.json');
  process.exit(1);
}
const user    = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
const address = `${user.city}, ${user.country}`;

// ── GEOCODING FUNCTION ───────────────────────────────────────────────────────
async function geocode(addr) {
  const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params: { address: addr, key: process.env.GOOGLE_MAPS_API_KEY }
  });
  const loc = res.data.results[0].geometry.location;
  return { lat: loc.lat, lon: loc.lng };
}

// ── FETCH NASA POWER DATA ────────────────────────────────────────────────────
async function fetchParams(lat, lon) {
  const res = await axios.get(
    'https://power.larc.nasa.gov/api/temporal/daily/point',
    {
      params: {
        parameters: 'WS2M,T2M,PRECTOTCORR',
        community:  'RE',
        latitude:   lat,
        longitude:  lon,
        start:      startDate,
        end:        endDate,
        format:     'JSON',
        api_key:    process.env.NASA_API_KEY
      }
    }
  );
  return res.data.properties.parameter;
}

// ── BUILD PIVOT FROM RAW DAILY DATA ──────────────────────────────────────────
function buildPivot(map) {
  const pivot = {};
  Object.entries(map).forEach(([ymd, v]) => {
    const md = `${ymd.slice(4,6)}-${ymd.slice(6,8)}`; // "MM-DD"
    const yr = ymd.slice(0,4);
    if (!pivot[md]) pivot[md] = {};
    pivot[md][yr] = v;
  });
  return pivot;
}

// ── WRITE TO FIXED CSV FILENAMES ────────────────────────────────────────────
function writeFixedCsv(paramName, pivot) {
  const dir  = path.resolve(__dirname, 'JsonData');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  // Write to e.g. 'wind.csv', 'temp.csv', 'rain.csv'
  const file = path.join(dir, `${paramName}.csv`);
  const sorted = Object.keys(pivot).sort((a,b) => {
    const [am,ad] = a.split('-').map(Number);
    const [bm,bd] = b.split('-').map(Number);
    return am === bm ? ad - bd : am - bm;
  });
  const header = ['month-day', ...years].join(',');
  const rows = sorted.map(md => [md, ...years.map(y => pivot[md][y] ?? '0')].join(','));
  fs.writeFileSync(file, [header, ...rows].join('\n'));
  console.log(`✅ Overwrote ${paramName}.csv`);
}

// ── MAIN ────────────────────────────────────────────────────────────────────
(async () => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error('❌ Set GOOGLE_MAPS_API_KEY in .env');
    process.exit(1);
  }

  console.log(`📍 Geocoding "${address}"`);
  const { lat, lon } = await geocode(address);

  console.log(`⏳ Fetching NASA POWER data`);
  const params = await fetchParams(lat, lon);

  // Pivot raw daily data
  const windPivot = buildPivot(params.WS2M);
  const tempPivot = buildPivot(params.T2M);
  const rainPivot = buildPivot(params.PRECTOTCORR);

  // Overwrite fixed CSVs
  writeFixedCsv('wind', windPivot);
  writeFixedCsv('temp', tempPivot);
  writeFixedCsv('rain', rainPivot);

  console.log('\nExport complete.');
})();
