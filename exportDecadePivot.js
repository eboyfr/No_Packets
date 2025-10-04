// exportDecadePivot.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

// ── CONFIGURE YOUR RANGE HERE ────────────────────────────────────────────────
// Span 2014–2024
const startDate = '20140101';
const endDate   = '20241231';

// Derive the list of years in the range
function ymdToDate(ymd) {
  const y = +ymd.slice(0,4);
  const m = +ymd.slice(4,6) - 1;
  const d = +ymd.slice(6,8);
  return new Date(y, m, d);
}
const start     = ymdToDate(startDate);
const end       = ymdToDate(endDate);
const years     = [];
for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
  years.push(String(y));
}

console.log(`⏳ Fetching data from ${startDate} to ${endDate}`);
console.log(`Years: ${years.join(',')}`);

// ── FETCH HELPER ────────────────────────────────────────────────────────────
async function fetchParameters(lat, lon, start, end) {
  const res = await axios.get(
    'https://power.larc.nasa.gov/api/temporal/daily/point',
    {
      params: {
        parameters: 'WS2M,T2M,PRECTOTCORR',
        community:  'RE',
        latitude:   lat,
        longitude:  lon,
        start,
        end,
        format:     'JSON',
        api_key:    process.env.NASA_API_KEY
      }
    }
  );
  return res.data.properties.parameter;
}

// ── COORDS LOADER ───────────────────────────────────────────────────────────
function getCoords() {
  const file = path.resolve(__dirname, 'coordinates.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return data.results[0].geometry.location; // { lat, lng }
}

// ── PIVOT BUILDER ────────────────────────────────────────────────────────────
// Creates an object: { "MM-DD": { "YYYY": value, … }, … }
function buildPivot(map) {
  const pivot = {};
  Object.entries(map).forEach(([ymd, val]) => {
    const mmdd = ymd.slice(4);                 // "MMDD"
    const key  = `${mmdd.slice(0,2)}-${mmdd.slice(2)}`; // "MM-DD"
    const year = ymd.slice(0,4);
    if (!pivot[key]) pivot[key] = {};
    pivot[key][year] = val;
  });
  return pivot;
}

// ── CSV WRITER ──────────────────────────────────────────────────────────────
// zeroFill toggles whether missing entries become '0' instead of ''
function writeCsv(filename, pivot, zeroFill = false) {
  const header = ['month-day', ...years].join(',');
  const rows = Object.keys(pivot)
    .sort((a, b) => {
      const [am,ad] = a.split('-').map(Number);
      const [bm,bd] = b.split('-').map(Number);
      return am === bm ? ad - bd : am - bm;
    })
    .map(md => {
      const values = years.map(y => {
        const v = pivot[md][y];
        if (v != null) return v;
        return zeroFill ? '0' : '';
      });
      return [md, ...values].join(',');
    });
  const out   = [header, ...rows].join('\n');
  const dir   = path.resolve(__dirname, 'JsonData');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(path.resolve(dir, filename), out);
  console.log(`✅ Wrote ${rows.length} rows to JsonData/${filename}`);
}

// ── MAIN EXECUTION ───────────────────────────────────────────────────────────
(async () => {
  try {
    const { lat, lng } = getCoords();
    const params       = await fetchParameters(lat, lng, startDate, endDate);

    // Build pivot tables for each parameter
    const windPivot = buildPivot(params.WS2M);
    const tempPivot = buildPivot(params.T2M);
    const rainPivot = buildPivot(params.PRECTOTCORR);

    // Write out CSVs
    writeCsv('wind.csv', windPivot, false);
    writeCsv('temp.csv',  tempPivot, false);
    writeCsv('rain.csv',  rainPivot, true);  // zero-fill missing rain entries

    console.log('All files written successfully.');
  } catch (err) {
    console.error('❌ Export pivot failed:', err.response?.data || err.message);
    process.exit(1);
  }
})();
