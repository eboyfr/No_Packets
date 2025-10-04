// exportDecade.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

// Helper to format YYYYMMDD
function fmt(d) {
  return d.toISOString().slice(0,10).replace(/-/g,'');
}

// 1. Compute ten-year range
const today     = new Date();
const endDate   = fmt(today);
const startDate = fmt(new Date(today.setFullYear(today.getFullYear() - 10)));

console.log(`⏳ Fetching 10-year data from ${startDate} to ${endDate}`);

// 2. Fetch all three parameters at once
async function fetchDecade(lat, lon, start, end) {
  const res = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
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
  });
  return res.data.properties.parameter;
}

// 3. Read geocoded coords
function getCoords() {
  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'coordinates.json'), 'utf8'));
  return data.results[0].geometry.location; // { lat, lng }
}

(async () => {
  try {
    const { lat, lng } = getCoords();
    const params       = await fetchDecade(lat, lng, startDate, endDate);

    // Extract parameter maps
    const windData = params.WS2M;
    const tempData = params.T2M;
    const rainData = params.PRECTOTCORR;

    // Build a sorted list of all dates
    const dates = Object.keys(windData)
      .filter(d => tempData[d] !== undefined && rainData[d] !== undefined)
      .sort(); // ascending

    // Prepare CSV writers
    const writeCsv = (filename, header, map) => {
      const file = path.resolve(__dirname, 'JsonData', filename);
      const out  = [header, ...dates.map(d => `${d},${map[d]}`)].join('\n');
      fs.writeFileSync(file, out);
      console.log(`✅ Wrote ${dates.length} rows to JsonData/${filename}`);
    };

    // Ensure folder exists
    const dir = path.resolve(__dirname, 'JsonData');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    // 4. Write separate CSVs
    writeCsv('wind.csv', 'date,wind_m_s', windData);
    writeCsv('temp.csv', 'date,temp_C',    tempData);
    writeCsv('rain.csv', 'date,rain_mm',    rainData);

  } catch (err) {
    console.error('❌ Error exporting decade:', err.response?.data || err.message);
    process.exit(1);
  }
})();
