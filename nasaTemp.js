// nasaTemp.js

const fs    = require('fs');
const path  = require('path');
const axios = require('axios');
require('dotenv').config({
  path: require('path').resolve(__dirname, '.env'),
  quiet: true
});

function getCoords() {
  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'coordinates.json')));
  return data.results[0].geometry.location;  // { lat, lng }
}

function formatDate(d) {
  return d.toISOString().slice(0,10).replace(/-/g,'');
}

async function fetchTemp({ start, end }) {
  const { lat, lng } = getCoords();
  const res = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
    params: {
      parameters: 'T2M', community: 'RE',
      latitude: lat, longitude: lng,
      start, end,
      format: 'JSON', api_key: process.env.NASA_API_KEY
    }
  });
  const data = res.data.properties.parameter.T2M;
  return Object.entries(data)
    .map(([date,val]) => ({ date, value: val }))
    .filter(e => e.value !== -999)
    .sort((a,b)=>b.date.localeCompare(a.date));
}

module.exports = fetchTemp;