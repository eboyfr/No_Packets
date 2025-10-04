const fs = require('fs');
const path = require('path');

function getCoordsFromFile(filePath = 'coordinates.json') {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
    const data = JSON.parse(raw);
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      throw new Error('No results array or empty results');
    }
  } catch (err) {
    console.error('Error reading coordinates.json:', err.message);
    return null;
  }
}

// Usage
const coords = getCoordsFromFile();
if (coords) {
  console.log(`Latitude: ${coords.lat}, Longitude: ${coords.lng}`);
}
