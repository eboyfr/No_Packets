// exportMultipleLocationsPivot.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

// ── CONFIGURE DATE RANGE HERE ────────────────────────────────────────────────
// Expanded from 2004 through 2024
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

// ── LOCATIONS WITH HARD-CODED COORDS ────────────────────────────────────────
// Define up to 10 locations with unique keys and lat/lon
const locations = [
  { key: 'Omsk, Russian Federation',    lat: 54.99244, lon: 73.36859},
  { key: 'Lattakia, Syria', lat: 35.516666666666666, lon: 35.78333333333333 },
  { key: 'San Luis Potosí, Mexico',  lat: 22.14982, lon: -100.97916 },
  { key: 'Serang, Indonesia', lat: -6.11528, lon: 106.15417 },
  { key: 'Brazzaville, Congo', lat: -4.26613, lon: 15.28318 },
  { key: 'Cotonou, Benin', lat:  6.36536, lon: 2.41833 },
  { key: 'Toamasina, Madagascar',    lat:  -18.154999999999998, lon: 49.41 },
  { key: 'Khartoum, Sudan, The Republic of', lat: 15.55177, lon: 32.53241 },
  { key: 'Multan, Pakistan',  lat: 30.19679, lon: 71.47824 },
  { key: 'Hirakata, Japan',lat: 34.81666666666667, lon: 135.65 }
];

// ── FETCH NASA POWER DATA ────────────────────────────────────────────────────
async function fetchParams(lat, lon) {
  const res = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
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
  });
  return res.data.properties.parameter;
}

// ── BUILD PIVOT ──────────────────────────────────────────────────────────────
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

// ── WRITE CSV ────────────────────────────────────────────────────────────────
function writeCsv(locKey, paramName, pivot) {
  const dir  = path.resolve(__dirname, 'JsonData');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  const file = path.join(dir, `${locKey}_${paramName}.csv`);
  const sorted = Object.keys(pivot).sort((a,b) => {
    const [am,ad] = a.split('-').map(Number);
    const [bm,bd] = b.split('-').map(Number);
    return am === bm ? ad - bd : am - bm;
  });
  const header = ['month-day', ...years].join(',');
  const rows   = sorted.map(md =>
    [md, ...years.map(y => pivot[md][y] ?? '0')].join(',')
  );
  fs.writeFileSync(file, [header, ...rows].join('\n'));
  console.log(`✅ Wrote ${path.basename(file)}`);
}

// ── MAIN ────────────────────────────────────────────────────────────────────
(async () => {
  for (const loc of locations.slice(0, 10)) {
    const { key, lat, lon } = loc;
    console.log(`\n⏳ Fetching data for ${key} (lat:${lat}, lon:${lon})`);
    const params = await fetchParams(lat, lon);

    // Build pivots
    const windPivot = buildPivot(params.WS2M);
    const tempPivot = buildPivot(params.T2M);
    const rainPivot = buildPivot(params.PRECTOTCORR);

    // Write CSVs
    writeCsv(key, 'wind', windPivot);
    writeCsv(key, 'temp', tempPivot);
    writeCsv(key, 'rain', rainPivot);
  }

  console.log('\nAll locations processed.');
})();
