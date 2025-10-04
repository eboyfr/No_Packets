// when the page loads, replace the time input with a dropdown for hourly selection
window.onload = function() {

  // create a <select> element for time
  var timeSelect = document.createElement('select');
  timeSelect.id = 'time';
  timeSelect.name = 'time';
  timeSelect.required = true;

  // add options for each hour (00:00 to 23:00)
  for (let h = 0; h < 24; h++) {
    let hour = h.toString().padStart(2, '0') + ':00';
    let option = document.createElement('option');
    option.value = hour;
    option.textContent = hour;
    timeSelect.appendChild(option);
  }

  // find the old time input and replace it with the new dropdown
  var oldInput = document.getElementById('time');
  if (oldInput) {
    oldInput.parentNode.replaceChild(timeSelect, oldInput);
  }
};
// keeps date range from today to one year from now
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");

  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  // Format to yyyy-mm-dd (the format <input type="date"> expects)
  const format = d => d.toISOString().split("T")[0];

  dateInput.min = format(today);
  dateInput.max = format(nextYear);

  console.log("Date range set:", dateInput.min, "→", dateInput.max);
});



// loading countries and cities from an api and populating the dropdown.


// some country names need to be adjusted to match the cities API
function normalizeCountryName(name) {
  const fixes = {
    "United States of America": "United States",
    "Russia": "Russian Federation",
    "Iran": "Iran, Islamic Republic of",
    "South Korea": "Korea, Republic of",
    "North Korea": "Korea, Democratic People's Republic of"

  };
  return fixes[name] || name;
}


// function to load, sort and populate countries dropdown
async function loadCountries() {
  try {

    //country api
    const response = await fetch("https://restcountries.com/v3.1/all?fields=name");

    //error check
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    //sort into an array
    const data = await response.json();
    console.log("Fetched countries:", Array.isArray(data) ? data.length : data);

    if (!Array.isArray(data)) {
      throw new Error("Data is not an array. Response may have failed.");
    }

    // Clear previous countries
    const countrySelect = document.getElementById("country");

    data
      .sort((a, b) => a.name.common.localeCompare(b.name.common))
      .forEach(country => {
        let option = document.createElement("option");
        option.value = country.name.common;
        option.textContent = country.name.common;
        countrySelect.appendChild(option);
      });

  } catch (err) {
    console.error("Error loading countries:", err);
    const countrySelect = document.getElementById("country");
    countrySelect.innerHTML = "<option>Error loading countries</option>";
  }
}


// load after cities when a country is selected
async function loadCities(countryName) {
  const citySelect = document.getElementById("city");
  citySelect.innerHTML = "<option>Loading...</option>";

  // fetch api
  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName })
    });

    const data = await response.json();

    // clear previous cities and sort
    citySelect.innerHTML = "";

  
    if (data.data && data.data.length > 0) {
      data.data
        .sort((a, b) => a.localeCompare(b))
        .forEach(city => {
          let option = document.createElement("option");
          option.value = city;
          option.textContent = city;
          citySelect.appendChild(option);
        });
    } else {
      citySelect.innerHTML = "<option>No cities found</option>";
    }

  } catch (err) {
    console.error("Error loading cities:", err);
    citySelect.innerHTML = "<option>Error loading cities</option>";
  }
}

// event listener for when it's clicked 
document.addEventListener("DOMContentLoaded", () => {
  loadCountries();

  document.getElementById("country").addEventListener("change", (e) => {
    loadCities(e.target.value);
  });
});