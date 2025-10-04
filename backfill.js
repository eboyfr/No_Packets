// backfill.js

const fs        = require('fs');
const path      = require('path');
const fetchWind = require('./nasaWind');
const fetchTemp = require('./nasaTemp');
const fetchRain = require('./nasaRain');

function fmt(d) {
  return d.toISOString().slice(0,10).replace(/-/g,'');
}

// Read existing dates from history.csv
function readExistingDates(file) {
  if (!fs.existsSync(file)) return new Set();
  const lines = fs.readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .slice(1); // skip header
  return new Set(lines.map(line => line.split(',')[0]));
}

(async () => {
  const historyFile = path.resolve(__dirname, 'history.csv');
  const existing    = readExistingDates(historyFile);

  // Accept start/end from CLI or default to last 30 days
  const [,, startArg, endArg] = process.argv;
  const endDate   = endArg   || fmt(new Date());
  const startDate = startArg || fmt(new Date(new Date().setDate(new Date().getDate() - 29)));

  console.log(`⏳ Backfilling data from ${startDate} to ${endDate}`);

  // Fetch data arrays for the given range
  const [winds, temps, rains] = await Promise.all([
    fetchWind({ start: startDate, end: endDate }),
    fetchTemp({ start: startDate, end: endDate }),
    fetchRain({ start: startDate, end: endDate })
  ]);

  // Map date → value for quick lookup
  const windMap = new Map(winds.map(e => [e.date, e.value]));
  const tempMap = new Map(temps.map(e => [e.date, e.value]));
  const rainMap = new Map(rains.map(e => [e.date, e.value]));

  // Generate full list of dates between start and end (inclusive)
  const dates = [];
  let d = new Date(startDate.slice(0,4), +startDate.slice(4,6)-1, +startDate.slice(6,8));
  const end   = new Date(endDate.slice(0,4), +endDate.slice(4,6)-1, +endDate.slice(6,8));
  while (d <= end) {
    dates.push(fmt(d));
    d.setDate(d.getDate() + 1);
  }

  // Ensure history.csv has a header
  if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, 'date,wind_m_s,temp_C,rain_mm\n');
  }

  // Append only dates not already present and with at least one defined value
  let appended = 0;
  for (const date of dates) {
    if (existing.has(date)) continue;
    const wind = windMap.get(date);
    const temp = tempMap.get(date);
    const rain = rainMap.get(date);

    if (wind != null || temp != null || rain != null) {
      fs.appendFileSync(
        historyFile,
        `${date},${wind ?? ''},${temp ?? ''},${rain ?? ''}\n`
      );
      appended++;
    }
  }

  console.log(`✅ Added ${appended} new day(s) to history.csv.`);
})();
