// nasaRain.js

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

async function fetchRain() {
  const { lat, lng } = getCoords();
  const today = new Date();
  const endDate   = formatDate(today);
  const startDate = formatDate(new Date(today.setDate(today.getDate() - 6)));

  const res = await axios.get('https://power.larc.nasa.gov/api/temporal/daily/point', {
    params: {
      parameters: 'PRECTOTCORR', community: 'RE',
      latitude: lat, longitude: lng,
      start: startDate, end: endDate,
      format: 'JSON', api_key: process.env.NASA_API_KEY
    }
  });

  const data = res.data.properties.parameter.PRECTOTCORR;
  const found = Object.entries(data)
    .sort((a,b)=>b[0].localeCompare(a[0]))
    .find(([,v])=>v!==-999 && v!=null);

  return found  // [date, value] or undefined
}

module.exports = fetchRain;
