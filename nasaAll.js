// nasaAll.js
require('dotenv').config({ path: './.env', quiet: true });
const fetchTemp = require('./nasaTemp');
const fetchRain = require('./nasaRain');
const fetchWind = require('./nasaWind');

function fmt(d) { return d.toISOString().slice(0,10).replace(/-/g,''); }

(async () => {
  // Example: user-specified range
  const start = '20251001';
  const end   = '20251004';

  console.log(`⏳ Fetching data from ${start} to ${end}`);
  const [temps, rains, winds] = await Promise.all([
    fetchTemp({ start, end }),
    fetchRain({ start, end }),
    fetchWind({ start, end })
  ]);

  // e.g. take the most recent date present in all three lists
  const dates = [temps[0]?.date, rains[0]?.date, winds[0]?.date]
    .filter(Boolean)
    .sort().reverse();
  const date = dates.find(d =>
    temps.some(e=>e.date===d) &&
    rains.some(e=>e.date===d) &&
    winds.some(e=>e.date===d)
  );

  if (!date) {
    console.log('❌ No overlapping data in that range');
    return;
  }

  const temp = temps.find(e=>e.date===date).value;
  const rain = rains.find(e=>e.date===date).value;
  const wind = winds.find(e=>e.date===date).value;

  console.log(`📅 ${date} → 💨 ${wind} m/s | 🌡️ ${temp}°C | 🌧️ ${rain} mm`);
})();