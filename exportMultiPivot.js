// exportMultiLocationPivot.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

// ── CONFIG: list your locations here ──────────────────────────────────────────
// Each entry needs a unique key and lat/lon
const locations = {
  nyc:    { lat: 40.7128, lon: -74.0060 },
  london: { lat: 51.5074, lon: -0.1278  },
  tokyo:  { lat: 35.6895, lon: 139.6917 },
  cape_town: { lat: -33.9221, lon: 18.4231},
  north_pole: { lat: -90.0000, lon: 45.0000},
};

// Span 2014–2024
const startDate = '20140101';
const endDate   = '20241231';

// Derive list of years from range
function ymdToDate(ymd) {
  return new Date(+ymd.slice(0,4), +ymd.slice(4,6) - 1, +ymd.slice(6,8));
}
const start = ymdToDate(startDate);
const end   = ymdToDate(endDate);
const years = [];
for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
  years.push(String(y));
}

// Helper: fetch WS2M,T2M,PRECTOTCORR for a point & date range
async function fetchParams(lat, lon) {
  const res = await axios.get(
    'https://power.larc.nasa.gov/api/temporal/daily/point',
    { params: {
        parameters:    'WS2M,T2M,PRECTOTCORR',
        community:     'RE',
        latitude:      lat,
        longitude:     lon,
        start:         startDate,
        end:           endDate,
        format:        'JSON',
        api_key:       process.env.NASA_API_KEY
      }}
  );
  return res.data.properties.parameter;
}

// Build pivot map: { MM-DD: { YYYY: value, … }, … }
function buildPivot(map) {
  const pivot = {};
  for (const [ymd, v] of Object.entries(map)) {
    const key  = `${ymd.slice(4,6)}-${ymd.slice(6,8)}`; // MM-DD
    const year = ymd.slice(0,4);
    pivot[key] ||= {};
    pivot[key][year] = v;
  }
  return pivot;
}

// Write CSV for one parameter and one location
function writeCsv(dir, locKey, paramName, pivot) {
  const filename = `${locKey}_${paramName}.csv`;
  const header   = ['month-day', ...years].join(',');
  const rows     = Object.keys(pivot)
    .sort((a,b)=>{
      const [am,ad]=a.split('-').map(Number);
      const [bm,bd]=b.split('-').map(Number);
      return am===bm?ad-bd:am-bm;
    })
    .map(md => {
      const vals = years.map(y => pivot[md][y] ?? '0');
      return [md, ...vals].join(',');
    });
  fs.writeFileSync(path.join(dir, filename), [header, ...rows].join('\n'));
  console.log(`✅ Wrote ${filename}`);
}

// Main
(async () => {
  const outDir = path.resolve(__dirname, 'JsonData');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  for (const [locKey, { lat, lon }] of Object.entries(locations)) {
    console.log(`⏳ Fetching for ${locKey}`);
    const params = await fetchParams(lat, lon);

    // Build pivots per parameter
    const windPivot = buildPivot(params.WS2M);
    const tempPivot = buildPivot(params.T2M);
    const rainPivot = buildPivot(params.PRECTOTCORR);

    // Write CSVs with zero-fill
    writeCsv(outDir, locKey, 'wind', windPivot);
    writeCsv(outDir, locKey, 'temp',  tempPivot);
    writeCsv(outDir, locKey, 'rain',  rainPivot);
  }

  console.log('All locations processed.');
})();
