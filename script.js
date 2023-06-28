// Global variables
var searchHistory = [];
var weatherApiRootUrl = 'https://api.openweathermap.org';
var weatherApiKey = 'b3fa3d3b239e314dd54de4c4686696b3';


// DOM element references
var searchForm = document.querySelector('#search-form'); //1
var searchInput = document.querySelector('#search-input'); //2
var todayContainer = document.querySelector('#today'); //3
var forecastContainer = document.querySelector('#forecast'); //4
var searchHistoryContainer = document.querySelector('#history'); //5

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc); //sent user timezone to utc then convert back
dayjs.extend(window.dayjs_plugin_timezone); // plugin to set on their users timezone

// Function to display the search history list.
function renderSearchHistory() {
  searchHistoryContainer.innerHTML = '';

  // Start at end of history array and count down to show the most recent at the top.
  for (var i = searchHistory.length - 1; i >= 0; i--) { // dont get this much from  the last element in an array is the array's length minus 1.
    var btn = document.createElement('button');  //make btn
    btn.setAttribute('type', 'button'); 
    btn.setAttribute('aria-controls', 'today forecast'); // Accessible Rich Internet Applications  IDs "today" and "forecast".
    btn.classList.add('history-btn', 'btn-history'); // class list is able to add more than 1 classes

    // `data-search` allows access to city name when click handler is invoked
    btn.setAttribute('data-search', searchHistory[i]);
    btn.textContent = searchHistory[i];
    searchHistoryContainer.append(btn);
  }
}

// Function to update history in local storage then updates displayed history.
function appendToHistory(search) { //update the search history and to fetch the weather data for that city
  // If there is no search term return the function
  if (searchHistory.indexOf(search) !== -1) { 
    return; //This line checks if the search term is already in the searchHistory array. If it is, the function returns immediately and does nothing
  }
  searchHistory.push(search); // new search

  localStorage.setItem('search-history', JSON.stringify(searchHistory)); //save and convert array to string bc local storage always does string
  renderSearchHistory();
}

// Function to get search history from local storage
function initSearchHistory() { //load the history
  var storedHistory = localStorage.getItem('search-history');
  if (storedHistory) {
    searchHistory = JSON.parse(storedHistory); // if it does have some then convert back to array i wish they should have the universal term to use so we dont have to convert all the time
  }
  renderSearchHistory();
}

// Function to display the current weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather) {
  var date = dayjs().format('M/D/YYYY');
  // Store response data from our fetch request in variables
  var tempF = weather.main.temp;
  var windMph = weather.wind.speed;
  var humidity = weather.main.humidity;
  var iconUrl = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`; //This constructs the URL for the weather icon image.
  var iconDescription = weather.weather[0].description || weather[0].main; //This gets the description of the weather icon.

  //creating new elements
  var card = document.createElement('div');
  var cardBody = document.createElement('div');
  var heading = document.createElement('h2');
  var weatherIcon = document.createElement('img');
  var tempEl = document.createElement('p');
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');
//adding classes
  card.setAttribute('class', 'card');
  cardBody.setAttribute('class', 'card-body');
  card.append(cardBody);

  heading.setAttribute('class', 'h3 card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  heading.textContent = `${city} (${date})`;
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  weatherIcon.setAttribute('class', 'weather-img');
  heading.append(weatherIcon);
  tempEl.textContent = `Temp: ${tempF}°F`; // element to the temperature.
  windEl.textContent = `Wind: ${windMph} MPH`; // element to the wind.
  humidityEl.textContent = `Humidity: ${humidity} %`; // same
  cardBody.append(heading, tempEl, windEl, humidityEl); // append child elements all of these to cardBody

  todayContainer.innerHTML = ''; //empty content
  todayContainer.append(card); // append card to todayContainer
}

// Function to display a forecast card given an object from open weather api
// daily forecast.
function renderForecastCard(forecast) { //name parameter forecast and show the weather forecast data for a single day.
  // variables for data from api
  var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`; // same with current weather data
  var iconDescription = forecast.weather[0].description; //icon description?? how
  var tempF = forecast.main.temp; 
  var humidity = forecast.main.humidity;
  var windMph = forecast.wind.speed;

  // Create elements for a card
  var col = document.createElement('div'); //create div
  var card = document.createElement('div'); //create div
  var cardBody = document.createElement('div'); //create div
  var cardTitle = document.createElement('h5'); //h5 element
  var weatherIcon = document.createElement('img'); //iconimage
  var tempEl = document.createElement('p'); //p tag
  var windEl = document.createElement('p');
  var humidityEl = document.createElement('p');

  col.append(card); //card becomes a child element of col, and it will be nested inside col in the HTML structure.
  card.append(cardBody); //similar concept
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl); //adding elements to cardBody

  col.setAttribute('class', 'col-md'); //no number SOOOO automatically take up equal space within its container, along with any other col-md elements.
  col.classList.add('five-day-card');
  card.setAttribute('class', 'card bg-primary h-100 text-white');
  cardBody.setAttribute('class', 'card-body p-2');
  cardTitle.setAttribute('class', 'card-title');
  tempEl.setAttribute('class', 'card-text');
  windEl.setAttribute('class', 'card-text');
  humidityEl.setAttribute('class', 'card-text');

  // Add content to elements
  cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
  weatherIcon.setAttribute('src', iconUrl);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windMph} MPH`;
  humidityEl.textContent = `Humidity: ${humidity} %`;

  forecastContainer.append(col);
}

// Function to display 5 day forecast.
function renderForecast(dailyForecast) {
  // Create unix timestamps for start and end of 5 day forecast
  var startDt = dayjs().add(1, 'day').startOf('day').unix();
  var endDt = dayjs().add(6, 'day').startOf('day').unix();

  var headingCol = document.createElement('div');
  var heading = document.createElement('h4');

  headingCol.setAttribute('class', 'col-12');
  heading.textContent = '5-Day Forecast:';
  headingCol.append(heading);

  forecastContainer.innerHTML = '';
  forecastContainer.append(headingCol);

  for (var i = 0; i < dailyForecast.length; i++) {

    // First filters through all of the data and returns only data that falls between one day after the current data and up to 5 days later.
    if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {

      // Then filters through the data and returns only data captured at noon for each day.
      if (dailyForecast[i].dt_txt.slice(11, 13) == "12") {
        renderForecastCard(dailyForecast[i]);
      }
    }
  }
}

function renderItems(city, data) {
  renderCurrentWeather(city, data.list[0], data.city.timezone);
  renderForecast(data.list);
}

// Fetches weather data for given location from the Weather Geolocation
// endpoint; then, calls functions to display current and forecast weather data.
function fetchWeather(location) {
  var { lat } = location;
  var { lon } = location;
  var city = location.name;

  var apiUrl = `${weatherApiRootUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      renderItems(city, data);
    })
    .catch(function (err) {
      console.error(err);
    });
}

function fetchCoords(search) {
  var apiUrl = `${weatherApiRootUrl}/geo/1.0/direct?q=${search}&limit=5&appid=${weatherApiKey}`;

  fetch(apiUrl)
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (!data[0]) {
        alert('Location not found');
      } else {
        appendToHistory(search);
        fetchWeather(data[0]);
      }
    })
    .catch(function (err) {
      console.error(err);
    });
}

function handleSearchFormSubmit(e) {
  // Don't continue if there is nothing in the search form
  if (!searchInput.value) {
    return;
  }

  e.preventDefault();
  var search = searchInput.value.trim();
  fetchCoords(search);
  searchInput.value = '';
}

function handleSearchHistoryClick(e) {
  // Don't do search if current elements is not a search history button
  if (!e.target.matches('.btn-history')) {
    return;
  }

  var btn = e.target;
  var search = btn.getAttribute('data-search');
  fetchCoords(search);
}

initSearchHistory();
searchForm.addEventListener('submit', handleSearchFormSubmit);
searchHistoryContainer.addEventListener('click', handleSearchHistoryClick);
