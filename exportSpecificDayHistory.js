// exportSpecificDayHistory.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

// ── LOAD USER DATA ──────────────────────────────────────────────────────────
// JsonData/user_data.json: { "country": "...", "city": "...", "date": "2025-10-09", "time": "..." }
const userDataPath = path.resolve(__dirname, 'JsonData', 'user_data.json');
if (!fs.existsSync(userDataPath)) {
  console.error('❌ Missing JsonData/user_data.json');
  process.exit(1);
}
const user = JSON.parse(fs.readFileSync(userDataPath, 'utf8'));
const address = `${user.city}, ${user.country}`;

// Extract month-day from the date field (e.g., "2025-10-09" -> "10-09")
const targetDate = new Date(user.date);
const month = String(targetDate.getMonth() + 1).padStart(2, '0');
const day   = String(targetDate.getDate()).padStart(2, '0');
const monthDay = `${month}-${day}`;

console.log(`📅 Target date: ${monthDay} (from ${user.date})`);

// ── DATE RANGE: PAST 20 YEARS ───────────────────────────────────────────────
const currentYear = new Date().getFullYear();
const startYear   = currentYear - 20; // 20 years including current year
const endYear     = currentYear - 1;
const startDate   = `${startYear}0101`;
const endDate     = `${endYear}1231`;

const years = [];
for (let y = startYear; y <= endYear; y++) {
  years.push(String(y));
}

console.log(`📊 Analyzing years: ${startYear}-${endYear}`);

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

// ── EXTRACT SPECIFIC DAY VALUES ─────────────────────────────────────────────
function extractDayValues(dataMap, targetMonthDay) {
  const values = [];
  for (const year of years) {
    // Construct the YYYYMMDD key for this year's target day
    const yyyymmdd = `${year}${targetMonthDay.replace('-', '')}`;
    const value = dataMap[yyyymmdd];
    values.push(value !== undefined ? value : 0);
  }
  return values;
}

// ── WRITE CSV ────────────────────────────────────────────────────────────────
function writeDayHistoryCsv(windValues, tempValues, rainValues) {
  const dir  = path.resolve(__dirname, 'JsonData');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  
  const file = path.join(dir, 'day_history.csv');
  const header = ['parameter', ...years].join(',');
  
  const rows = [
    ['wind', ...windValues].join(','),
    ['temp', ...tempValues].join(','),
    ['rain', ...rainValues].join(',')
  ];
  
  const csv = [header, ...rows].join('\n');
  fs.writeFileSync(file, csv);
  console.log(`✅ Wrote day_history.csv with ${monthDay} data for past 20 years`);
}

// ── MAIN ────────────────────────────────────────────────────────────────────
(async () => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error('❌ Set GOOGLE_MAPS_API_KEY in .env');
    process.exit(1);
  }

  console.log(`📍 Geocoding "${address}"`);
  const { lat, lon } = await geocode(address);

  console.log(`⏳ Fetching NASA POWER data for past 20 years`);
  const params = await fetchParams(lat, lon);

  // Extract values for the specific day across all years
  const windValues = extractDayValues(params.WS2M, monthDay);
  const tempValues = extractDayValues(params.T2M, monthDay);
  const rainValues = extractDayValues(params.PRECTOTCORR, monthDay);

  // Write the 3-row CSV
  writeDayHistoryCsv(windValues, tempValues, rainValues);

  console.log('\nDay history export complete.');
})();
