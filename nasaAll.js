// nasaAll.js

require('dotenv').config({
  path: require('path').resolve(__dirname, '.env'),
  quiet: true
});

const fetchWind = require('./nasaWind');
const fetchTemp = require('./nasaTemp');
const fetchRain = require('./nasaRain');

(async () => {
  try {
    const windRec = await fetchWind();
    const tempRec = await fetchTemp();
    const rainRec = await fetchRain();

    if (!windRec || !tempRec || !rainRec) {
      console.error('❌ Could not retrieve all parameters.');
      process.exit(1);
    }

    // Ensure same date or pick most recent overlapping date
    const dates = [windRec[0], tempRec[0], rainRec[0]];
    const date  = dates.sort((a,b)=>b.localeCompare(a)).find(d =>
      windRec[0]===d && tempRec[0]===d && rainRec[0]===d
    ) || dates[0];

    const wind = windRec[0]===date ? windRec[1] : 'N/A';
    const temp = tempRec[0]===date ? tempRec[1] : 'N/A';
    const rain = rainRec[0]===date ? rainRec[1] : 'N/A';

    console.log(`📅 ${date} → 💨 ${wind} m/s | 🌡️ ${temp} °C | 🌧️ ${rain} mm`);
  } catch (err) {
    console.error('❌ Error in nasaAll:', err.message);
    process.exit(1);
  }
})();
