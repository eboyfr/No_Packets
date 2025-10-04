// nasaRain.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), quiet: true });

function getCoords() {
  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'coordinates.json'), 'utf8'));
  return data.results[0].geometry.location;  // { lat, lng }
}

async function fetchRain({ start, end }) {
  const { lat, lng } = getCoords();
  const res = await axios.get(
    'https://power.larc.nasa.gov/api/temporal/daily/point',
    {
      params: {
        parameters: 'PRECTOTCORR',  // corrected precipitation
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

  // Validate response structure
  if (!res.data || !res.data.properties || !res.data.properties.parameter) {
    console.error('Unexpected response:', JSON.stringify(res.data, null, 2));
    throw new Error('Missing properties.parameter block');
  }

  const params = res.data.properties.parameter;
  //console.log('Available parameters:', Object.keys(params));

  const data = params.PRECTOTCORR;
  if (!data) {
    console.error('PRECTOTCORR not found. Available keys above.');
    throw new Error('PRECTOTCORR missing from API response');
  }

  return Object.entries(data)
    .map(([date, value]) => ({ date, value }))
    .filter(e => e.value !== -999 && e.value != null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

module.exports = fetchRain;
