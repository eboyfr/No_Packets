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
const user   = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
const locKey = user.city.replace(/\s+/g, '_');                    // e.g. ’Aïn_Abid
const address= `${user.city}, ${user.country}`;                    // "’Aïn Abid, Algeria"

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

// ── BUILD PIVOT ──────────────────────────────────────────────────────────────
function buildPivot(map) {
  const pivot = {};
  Object.entries(map).forEach(([ymd, v]) => {
    // ymd here may be YYYYMMDD of first day of each 3-day block
    const md = `${ymd.slice(4,6)}-${ymd.slice(6,8)}`; // "MM-DD"
    const yr = ymd.slice(0,4);
    if (!pivot[md]) pivot[md] = {};
    pivot[md][yr] = v;
  });
  return pivot;
}

// ── 3-DAY AVERAGE HELPER ─────────────────────────────────────────────────────
/**
 * Given a map YYYYMMDD→number, returns YYYYMMDD→3-day average,
 * keyed by the first date of each consecutive triplet.
 */
function threeDayAverages(dailyMap) {
  const dates = Object.keys(dailyMap).sort();
  const avgMap = {};
  for (let i = 0; i + 2 < dates.length; i += 3) {
    const group = dates.slice(i, i + 3);             // e.g. ['20140101','20140102','20140103']
    const sum   = group.reduce((s, d) => s + (dailyMap[d] ?? 0), 0);
    avgMap[group[0]] = parseFloat((sum / 3).toFixed(3)); // key by first date
  }
  return avgMap;
}

// ── WRITE CSV WITH CONDITIONAL SMOOTHING ────────────────────────────────────
/**
 * Writes a pivoted CSV where each cell is:
 * - the raw value for the 2024 column
 * - the centered 3-point average for all other years
 */
function writeCsv(paramName, pivot) {
  const dir    = path.resolve(__dirname, 'JsonData');
  const file   = path.join(dir, `${locKey}_${paramName}.csv`);
  const sorted = Object.keys(pivot).sort((a,b) => {
    const [am,ad]=a.split('-').map(Number);
    const [bm,bd]=b.split('-').map(Number);
    return am===bm?ad-bd:am-bm;
  });

  // Build raw matrix [row][col]
  const matrix = sorted.map(md =>
    years.map(y => Number(pivot[md]?.[y] ?? 0))
  );

  // Identify the index of the 2024 column
  const idx2024 = years.indexOf('2024');

  // Apply smoothing except for 2024 column
  const smoothed = matrix.map((row, i) =>
    row.map((val, j) => {
      if (j === idx2024) {
        // keep raw for 2024
        return val.toFixed(3);
      }
      const prev = matrix[i-1]?.[j] ?? val;
      const next = matrix[i+1]?.[j] ?? val;
      return ((prev + val + next) / 3).toFixed(3);
    })
  );

  // Write CSV
  const header = ['month-day', ...years].join(',');
  const rows = sorted.map((md, i) =>
    [md, ...smoothed[i]].join(',')
  );
  fs.writeFileSync(file, [header, ...rows].join('\n'));
  console.log(`✅ Wrote ${path.basename(file)}`);
}


// ── MAIN ────────────────────────────────────────────────────────────────────
;(async () => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error('❌ Set GOOGLE_MAPS_API_KEY in .env');
    process.exit(1);
  }

  console.log(`📍 Geocoding "${address}"`);
  const { lat, lon } = await geocode(address);

  console.log(`⏳ Fetching NASA POWER data for ${locKey}`);
  const params = await fetchParams(lat, lon);

  // 1) Compute raw daily and 3-day average maps
  const rawWind  = params.WS2M;
  const rawTemp  = params.T2M;
  const rawRain  = params.PRECTOTCORR;
  const wind3Day = threeDayAverages(rawWind);
  const temp3Day = threeDayAverages(rawTemp);
  const rain3Day = threeDayAverages(rawRain);

  // 2) Pivot each map so rows are 3-day blocks by month-day
  const windPivot   = buildPivot(wind3Day);
  const tempPivot   = buildPivot(temp3Day);
  const rainPivot   = buildPivot(rain3Day);

  // 3) Write only the 3-day grouped CSVs
  writeCsv('wind3day', windPivot, true);
  writeCsv('temp3day', tempPivot, true);
  writeCsv('rain3day', rainPivot, true);

  console.log('\n3-day grouped export complete.');
})();
