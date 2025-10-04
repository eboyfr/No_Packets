// nasaWind.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

function getCoords() {
  const file = path.resolve(__dirname, 'coordinates.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return data.results[0].geometry.location;  // { lat, lng }
}

function fmt(d) {
  return d.toISOString().slice(0,10).replace(/-/g,'');
}

async function fetchWind({ start, end }) {
  const { lat, lng } = getCoords();
  const res = await axios.get(
    'https://power.larc.nasa.gov/api/temporal/daily/point',
    {
      params: {
        parameters: 'WS2M',    // wind speed at 2 m
        community: 'RE',
        latitude: lat,
        longitude: lng,
        start,
        end,
        format: 'JSON',
        api_key: process.env.NASA_API_KEY
      }
    }
  );

  // Defensive checks
  if (!res.data || !res.data.properties || !res.data.properties.parameter) {
    console.error('Unexpected API response structure:', JSON.stringify(res.data, null, 2));
    throw new Error('Missing properties.parameter block in POWER API response');
  }
  
  const winds = res.data.properties.parameter.WS2M;
  if (!winds) {
    console.error('WS2M block not found. Available parameters:', Object.keys(res.data.properties.parameter));
    throw new Error('WS2M parameter missing from API response');
  }

  // Return entries sorted newest → oldest
  return Object.entries(winds)
    .map(([date, value]) => ({ date, value }))
    .filter(e => e.value !== -999 && e.value != null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

module.exports = fetchWind;
