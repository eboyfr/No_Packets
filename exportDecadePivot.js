// exportDecadePivot.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname,'.env'), quiet:true });

// ── CONFIG ───────────────────────────────────────────────────────────────────
const startYear = 2014;
const endYear   = 2024;
const years     = [];
for (let y = startYear; y <= endYear; y++) years.push(String(y));

// ── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = d => {
  const Y = d.getFullYear();
  const M = String(d.getMonth()+1).padStart(2,'0');
  const D = String(d.getDate()).padStart(2,'0');
  return `${Y}${M}${D}`;
};

async function fetchYear(lat, lon, year) {
  const start = `${year}0101`;
  const end   = `${year}1231`;
  const res = await axios.get(
    'https://power.larc.nasa.gov/api/temporal/daily/point',
    { params:{
        parameters: 'WS2M,T2M,PRECTOTCORR',
        community:  'RE',
        latitude:   lat,
        longitude:  lon,
        start, end,
        format:     'JSON',
        api_key:    process.env.NASA_API_KEY
      }}
  );
  return res.data.properties.parameter;
}

function getCoords() {
  const json = fs.readFileSync(path.resolve(__dirname,'coordinates.json'),'utf8');
  return JSON.parse(json).results[0].geometry.location;
}

(async() => {
  const { lat, lng } = getCoords();

  // 1. Fetch each year's data
  const yearData = {};
  for (const y of years) {
    console.log(`⏳ Fetching ${y}`);
    yearData[y] = await fetchYear(lat, lng, y);
  }

  // 2. Build pivot for each parameter
  const buildPivot = param => {
    const pivot = {};
    for (const y of years) {
      const map = yearData[y][param];
      for (const [ymd, val] of Object.entries(map)) {
        const mmdd = ymd.slice(4);
        const key  = `${mmdd.slice(0,2)}-${mmdd.slice(2)}`;
        pivot[key] ||= {};
        pivot[key][y] = val;
      }
    }
    return pivot;
  };

  const windPivot = buildPivot('WS2M');
  const tempPivot = buildPivot('T2M');
  const rainPivot = buildPivot('PRECTOTCORR');

  // 3. Write CSVs
  const dir = path.resolve(__dirname,'JsonData');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const write = (fn,pivot) => {
    const header = ['month-day',...years].join(',');
    const rows = Object.keys(pivot)
      .sort((a,b)=>{
        const [am,ad]=a.split('-').map(Number);
        const [bm,bd]=b.split('-').map(Number);
        return am===bm?ad-bd:am-bm;
      })
      .map(md=>[md,...years.map(y=>pivot[md][y]||'')].join(','));
    fs.writeFileSync(path.resolve(dir,fn),[header,...rows].join('\n'));
    console.log(`✅ ${fn} written`);
  };

  write('wind.csv', windPivot);
  write('temp.csv', tempPivot);
  write('rain.csv', rainPivot);

  console.log('All done.');
})();
