const axios = require('axios');

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error('❌ GOOGLE_MAPS_API_KEY environment variable is not set');
  process.exit(1);
}

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

/**
 * Convert a place name or address into coordinates.
 * @param {string} place
 * @returns {Promise<{ latitude: number, longitude: number, formatted_address: string }>}
 */
async function getCoordinates(place) {
  try {
    const response = await axios.get(GEOCODE_URL, {
      params: { address: place, key: API_KEY },
      timeout: 10000
    });
    const data = response.data;

    if (data.status === 'OK' && data.results.length) {
      const { lat, lng } = data.results[0].geometry.location;
      const formatted = data.results[0].formatted_address;
      return { latitude: lat, longitude: lng, formatted_address: formatted };
    }

    throw new Error(`Geocoding failed: ${data.status}`);
  } catch (err) {
    throw new Error(`Request error: ${err.message}`);
  }
}

// Example usage
(async () => {
  try {
    const place = process.argv[2] || 'Eiffel Tower, Paris';
    const { latitude, longitude, formatted_address } = await getCoordinates(place);
    console.log(`✅ ${formatted_address}`);
    console.log(`📍 Latitude: ${latitude}, Longitude: ${longitude}`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
})();
