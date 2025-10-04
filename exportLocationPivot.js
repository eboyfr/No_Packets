// exportLocationPivot.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

// ── CONFIGURE RANGE HERE ─────────────────────────────────────────────────────
const startDate = '20140101';
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
const user = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
const locKey = user.city.replace(/\s+/g, '_');            // e.g. ’Aïn_Abid
const address= `${user.city}, ${user.country}`;            // "’Aïn Abid, Algeria"

// ── GEOCODING FUNCTION ───────────────────────────────────────────────────────
// Replace with your geocoding service
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

// ── BUILD PIVOT ──────────────────────────────────────────────────────────────
function buildPivot(map) {
  const pivot = {};
  for (const [ymd, v] of Object.entries(map)) {
    const mm = ymd.slice(4,6);
    const dd = ymd.slice(6,8);
    const md = `${mm}-${dd}`;
    const yr = ymd.slice(0,4);
    pivot[md] ||= {};
    pivot[md][yr] = v;
  }
  return pivot;
}

// ── WRITE CSV ────────────────────────────────────────────────────────────────
// zeroFill: fill missing with '0'
function writeCsv(paramName, pivot, zeroFill = false) {
  const header = ['month-day', ...years].join(',');
  const rows   = Object.keys(pivot)
    .sort((a,b) => {
      const [am,ad] = a.split('-').map(Number);
      const [bm,bd] = b.split('-').map(Number);
      return am === bm ? ad - bd : am - bm;
    })
    .map(md => {
      const vals = years.map(y => {
        const val = pivot[md][y];
        return val != null ? val : (zeroFill ? '0' : '');
      });
      return [md, ...vals].join(',');
    });
  const dir  = path.resolve(__dirname, 'JsonData');
  const file = path.join(dir, `${locKey}_${paramName}.csv`);
  fs.writeFileSync(file, [header, ...rows].join('\n'));
  console.log(`✅ Wrote ${path.basename(file)}`);
}

// ── MAIN ────────────────────────────────────────────────────────────────────
;(async () => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error('❌ Set GOOGLE_API_KEY in .env');
    process.exit(1);
  }

  console.log(`\n📍 Geocoding "${address}"`);
  const { lat, lon } = await geocode(address);

  console.log(`⏳ Fetching NASA POWER data for ${locKey}`);
  const params = await fetchParams(lat, lon);

  const windPivot = buildPivot(params.WS2M);
  const tempPivot = buildPivot(params.T2M);
  const rainPivot = buildPivot(params.PRECTOTCORR);

  writeCsv('wind', windPivot, true);
  writeCsv('temp',  tempPivot, true);
  writeCsv('rain',  rainPivot, true);

  console.log('\nExport complete.');
})();
