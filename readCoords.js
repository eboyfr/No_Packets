// readCoords.js

const fs = require('fs');
const path = require('path');

function getCoordsFromFile(filePath = 'coordinates.json') {
  const fullPath = path.resolve(__dirname, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error('❌ File not found:', fullPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(fullPath, 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error('❌ JSON parse error:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(data.results) || data.results.length === 0) {
    console.error('❌ No results in JSON');
    process.exit(1);
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}

// Usage
const { lat, lng } = getCoordsFromFile();
console.log(`Latitude: ${lat}, Longitude: ${lng}`);
