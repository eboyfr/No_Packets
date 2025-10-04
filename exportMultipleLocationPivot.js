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
{ key: 'Reykjavik_Iceland',    lat: 64.1466,  lon: -21.9426  },
  { key: 'Valparaiso_Chile',     lat: -33.0472, lon: -71.6127  },
  { key: 'Tallinn_Estonia',      lat: 59.4370,  lon: 24.7536   },
  { key: 'Quito_Ecuador',        lat: -0.1807,  lon: -78.4678  },
  { key: 'Ulaanbaatar_Mongolia', lat: 47.8864,  lon: 106.9057  },
  { key: 'Luanda_Angola',        lat: -8.8390,  lon: 13.2894   },
  { key: 'Wellington_NZ',        lat: -41.2865, lon: 174.7762  },
  { key: 'Helsinki_Finland',     lat: 60.1699,  lon: 24.9384   },
  { key: 'Karachi_Pakistan',     lat: 24.8607,  lon: 67.0011   },
  { key: 'Vienna_Austria',       lat: 48.2082,  lon: 16.3738   }
]

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
