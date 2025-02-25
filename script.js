const API_KEY = '5f472b7acba333cd8a035ea85a0d4d4c'; // Changed to a valid OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_ICONS_URL = 'https://openweathermap.org/img/wn';
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('btn');
const locationBtn = document.getElementById('getCurrentLocation');
const weatherContainer = document.querySelector('.weather-container');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const dismissError = document.getElementById('dismissError');
const recentSearchesList = document.getElementById('recentSearchesList');
const metricToggle = document.getElementById('metricToggle');
const imperialToggle = document.getElementById('imperialToggle');
const themeSwitch = document.getElementById('themeSwitch');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeModal = document.querySelector('.close');
const clearDataBtn = document.getElementById('clearDataBtn');
const animationsToggle = document.getElementById('animationsToggle');
const bgEffectsToggle = document.getElementById('bgEffectsToggle');
const autoRefreshToggle = document.getElementById('autoRefreshToggle');
const refreshInterval = document.getElementById('refreshInterval');
const weatherBg = document.querySelector('.weather-bg');

let currentUnit = 'metric';
let autoRefreshTimer = null;
let lastSearchedCity = '';
let currentWeatherData = null;
let recentSearches = [];

function initApp() {
    loadSettings();
    loadRecentSearches();
    setupEventListeners();
    checkDarkMode();
}

function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    locationBtn.addEventListener('click', getUserLocation);

    metricToggle.addEventListener('click', () => setUnit('metric'));
    imperialToggle.addEventListener('click', () => setUnit('imperial'));

    themeSwitch.addEventListener('change', toggleTheme);

    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
    closeModal.addEventListener('click', () => settingsModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.style.display = 'none';
    });
    clearDataBtn.addEventListener('click', clearSearchHistory);
    animationsToggle.addEventListener('change', updateAnimationSettings);
    bgEffectsToggle.addEventListener('change', updateBackgroundSettings);
    autoRefreshToggle.addEventListener('change', toggleAutoRefresh);
    refreshInterval.addEventListener('change', updateRefreshInterval);
    dismissError.addEventListener('click', () => errorMessage.style.display = 'none');
}


function handleSearch() {
    const city = cityInput.value.trim();
    if (city === '') {
        showError('Please enter a city name');
        return;
    }
    
    getWeatherData(city);
}

async function getWeatherData(city) {
    showLoading(true);
    lastSearchedCity = city;

    try {

        const weatherResponse = await fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`);
        if (!weatherResponse.ok) {
            throw new Error(weatherResponse.statusText);
        }
        const weatherData = await weatherResponse.json();
        
        
        const forecastResponse = await fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`);
        if (!forecastResponse.ok) {
            throw new Error(forecastResponse.statusText);
        }
        const forecastData = await forecastResponse.json();
        
        const { lat, lon } = weatherData.coord;
        const airQualityResponse = await fetch(
            `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );
        if (!airQualityResponse.ok) {
            throw new Error(airQualityResponse.statusText);
        }
        const airQualityData = await airQualityResponse.json();
        
        currentWeatherData = {
            current: weatherData,
            forecast: forecastData,
            airQuality: airQualityData
        };
        
        displayWeatherData();
        updateRecentSearches(city);
        
    } catch (error) {
        showError(`City not found: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function displayWeatherData() {
    if (!currentWeatherData) return;
    
    const { current, forecast, airQuality } = currentWeatherData;
    
    // Display Current Weather
    displayCurrentWeather(current);
    
    // Display Forecast
    displayForecast(forecast);
    
    // Display Air Quality
    displayAirQuality(airQuality);
    
    // Display Hourly Forecast
    displayHourlyForecast(forecast);
    
    // Update Sun Times
    displaySunTimes(current);
    
    // Update Background
    updateWeatherBackground(current.weather[0].main);
    
    // Make weather container visible with animation
    weatherContainer.style.opacity = '1';
}

function displayCurrentWeather(data) {
    // Basic Info
    document.getElementById('cityName').textContent = data.name;
    document.getElementById('country').textContent = data.sys.country;
    document.getElementById('date').textContent = formatDate(new Date());
    
    // Weather Icon
    const iconCode = data.weather[0].icon;
    const iconElement = document.getElementById('weatherIcon');
    iconElement.innerHTML = `<img src="${WEATHER_ICONS_URL}/${iconCode}@2x.png" alt="${data.weather[0].description}">`;
    
    // Temperature and Description
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    document.getElementById('temperature').textContent = `${temp}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    document.getElementById('feelsLike').textContent = `${feelsLike}°${currentUnit === 'metric' ? 'C' : 'F'}`;
    document.getElementById('description').textContent = data.weather[0].description;
    
    // Weather Details
    const windSpeed = currentUnit === 'metric' 
        ? `${data.wind.speed} m/s` 
        : `${data.wind.speed} mph`;
    
    document.getElementById('windSpeed').textContent = windSpeed;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    const visibilityKm = data.visibility / 1000;
    const visibilityMiles = visibilityKm * 0.621371;
    const visibilityText = currentUnit === 'metric' 
        ? `${visibilityKm.toFixed(1)} km` 
        : `${visibilityMiles.toFixed(1)} mi`;
    
    document.getElementById('visibility').textContent = visibilityText;
}

function displayForecast(forecastData) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';
    
    // Get one forecast per day (noon time)
    const dailyForecasts = getDailyForecasts(forecastData.list);
    
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconCode = forecast.weather[0].icon;
        const maxTemp = Math.round(forecast.main.temp_max);
        const minTemp = Math.round(forecast.main.temp_min);
        
        const forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');
        forecastItem.innerHTML = `
            <div class="day">${day}</div>
            <div class="forecast-icon">
                <img src="${WEATHER_ICONS_URL}/${iconCode}.png" alt="${forecast.weather[0].description}">
            </div>
            <div class="forecast-temp">
                <div class="high">${maxTemp}°</div>
                <div class="low">${minTemp}°</div>
            </div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

function displayHourlyForecast(forecastData) {
    const hourlyContainer = document.getElementById('hourlyForecast');
    hourlyContainer.innerHTML = '';
    
    // Display the next 24 hours (8 entries)
    const hourlyData = forecastData.list.slice(0, 8);
    
    hourlyData.forEach(hourData => {
        const date = new Date(hourData.dt * 1000);
        const hour = date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
        const iconCode = hourData.weather[0].icon;
        const temp = Math.round(hourData.main.temp);
        
        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <div class="hour">${hour}</div>
            <div class="hourly-icon">
                <img src="${WEATHER_ICONS_URL}/${iconCode}.png" alt="${hourData.weather[0].description}">
            </div>
            <div class="hourly-temp">${temp}°</div>
        `;
        
        hourlyContainer.appendChild(hourlyItem);
    });
}

function displayAirQuality(airQualityData) {
    const aqi = airQualityData.list[0].main.aqi; // AQI value (1-5)
    
    // Position the marker based on AQI (0-20-40-60-80-100%)
    const markerPosition = (aqi - 1) * 20 + 10; // Center in each segment
    document.getElementById('aqiMarker').style.left = `${markerPosition}%`;
    
    document.getElementById('aqiValue').textContent = aqi;
    
    // Display AQI description
    const descriptions = [
        'Good',
        'Moderate',
        'Poor',
        'Unhealthy',
        'Very Unhealthy'
    ];
    document.getElementById('aqiDescription').textContent = descriptions[aqi - 1];
}

function displaySunTimes(weatherData) {
    const sunriseTime = new Date(weatherData.sys.sunrise * 1000);
    const sunsetTime = new Date(weatherData.sys.sunset * 1000);
    const currentTime = new Date();
    
    // Format times
    const sunriseFormatted = sunriseTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    const sunsetFormatted = sunsetTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    
    document.getElementById('sunrise').textContent = sunriseFormatted;
    document.getElementById('sunset').textContent = sunsetFormatted;
    

    positionSunIcon(sunriseTime, sunsetTime, currentTime);
}

function positionSunIcon(sunrise, sunset, current) {
    const sunPosition = document.getElementById('sunPosition');

    let position = 0;
    
    if (current >= sunrise && current <= sunset) {

        const totalDayTime = sunset - sunrise;
        const timeSinceSunrise = current - sunrise;
        position = (timeSinceSunrise / totalDayTime) * 100;
        

        sunPosition.style.bottom = `${Math.sin(Math.PI * (position / 100)) * 80}px`;
        sunPosition.style.left = `${position}%`;
        sunPosition.style.display = 'block';
    } else {

        sunPosition.style.display = 'none';
    }
}

function getDailyForecasts(forecastList) {
    // Group forecasts by day and get the noon forecast for each day
    const dailyForecasts = [];
    const dayMap = new Map();
    
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toISOString().split('T')[0];
        const hour = date.getHours();

        if (!dayMap.has(day) || Math.abs(hour - 12) < Math.abs(dayMap.get(day).hour - 12)) {
            dayMap.set(day, { 
                forecast, 
                hour 
            });
        }
    });
    

    return Array.from(dayMap.values())
        .map(entry => entry.forecast)
        .slice(0, 5);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateWeatherBackground(weatherCondition) {

    weatherBg.className = 'weather-bg';
    

    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            weatherBg.classList.add('clear-sky');
            break;
        case 'clouds':
            weatherBg.classList.add('clouds');
            break;
        case 'rain':
        case 'drizzle':
            weatherBg.classList.add('rain');
            break;
        case 'snow':
            weatherBg.classList.add('snow');
            break;
        case 'thunderstorm':
            weatherBg.classList.add('thunder');
            break;
        case 'mist':
        case 'fog':
        case 'haze':
            weatherBg.classList.add('mist');
            break;
        default:
            weatherBg.classList.add('clear-sky');
    }
}

function getUserLocation() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                showLoading(false);
                showError('Unable to retrieve your location');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

async function getWeatherByCoords(lat, lon) {
    showLoading(true);
    
    try {

        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
        if (!geoResponse.ok) {
            throw new Error(geoResponse.statusText);
        }
        const geoData = await geoResponse.json();
        
        if (geoData.length > 0) {
            const cityName = geoData[0].name;
            cityInput.value = cityName;
            lastSearchedCity = cityName;

            await getWeatherData(cityName);
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        showError(`Error getting location: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

function updateRecentSearches(city) {
    if (!city) return;
    

    recentSearches = recentSearches.filter(item => item.toLowerCase() !== city.toLowerCase());
    

    recentSearches.unshift(city);

    if (recentSearches.length > 5) {
        recentSearches = recentSearches.slice(0, 5);
    }
    

    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));

    displayRecentSearches();
}

function displayRecentSearches() {
    recentSearchesList.innerHTML = '';
    
    recentSearches.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.addEventListener('click', () => {
            cityInput.value = city;
            getWeatherData(city);
        });
        
        recentSearchesList.appendChild(button);
    });
}

function loadRecentSearches() {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
        recentSearches = JSON.parse(savedSearches);
        displayRecentSearches();
    }
}

function clearSearchHistory() {
    recentSearches = [];
    localStorage.removeItem('recentSearches');
    recentSearchesList.innerHTML = '';
    showError('Search history cleared', true);
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 2000);
}

function setUnit(unit) {
    if (currentUnit === unit) return;
    
    currentUnit = unit;

    if (unit === 'metric') {
        metricToggle.classList.add('active');
        imperialToggle.classList.remove('active');
    } else {
        metricToggle.classList.remove('active');
        imperialToggle.classList.add('active');
    }
    

    localStorage.setItem('units', unit);

    if (lastSearchedCity) {
        getWeatherData(lastSearchedCity);
    }
}

function toggleTheme() {
    if (themeSwitch.checked) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('darkMode', 'disabled');
    }
}

function checkDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }
}

function loadSettings() {
    // Load unit preference
    const savedUnit = localStorage.getItem('units');
    if (savedUnit) {
        setUnit(savedUnit);
    }
const animationsEnabled = localStorage.getItem('animationsEnabled');
    if (animationsEnabled === 'disabled') {
        animationsToggle.checked = false;
        document.body.classList.add('no-animations');
    }

    const bgEffectsEnabled = localStorage.getItem('bgEffectsEnabled');
    if (bgEffectsEnabled === 'disabled') {
        bgEffectsToggle.checked = false;
        document.querySelector('.particles').style.display = 'none';
    }

    const autoRefresh = localStorage.getItem('autoRefresh');
    if (autoRefresh === 'enabled') {
        autoRefreshToggle.checked = true;
        refreshInterval.disabled = false;

        const interval = localStorage.getItem('refreshInterval') || '15';
        refreshInterval.value = interval;

        startAutoRefresh(parseInt(interval));
    }
}

function updateAnimationSettings() {
    if (animationsToggle.checked) {
        document.body.classList.remove('no-animations');
        localStorage.setItem('animationsEnabled', 'enabled');
    } else {
        document.body.classList.add('no-animations');
        localStorage.setItem('animationsEnabled', 'disabled');
    }
}

function updateBackgroundSettings() {
    const particles = document.querySelector('.particles');
    
    if (bgEffectsToggle.checked) {
        particles.style.display = 'block';
        localStorage.setItem('bgEffectsEnabled', 'enabled');
    } else {
        particles.style.display = 'none';
        localStorage.setItem('bgEffectsEnabled', 'disabled');
    }
}

function toggleAutoRefresh() {
    if (autoRefreshToggle.checked) {
        refreshInterval.disabled = false;
        localStorage.setItem('autoRefresh', 'enabled');
        
        const interval = refreshInterval.value;
        localStorage.setItem('refreshInterval', interval);
        startAutoRefresh(parseInt(interval));
    } else {
        refreshInterval.disabled = true;
        localStorage.setItem('autoRefresh', 'disabled');

        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
            autoRefreshTimer = null;
        }
    }
}

function updateRefreshInterval() {
    const interval = refreshInterval.value;
    localStorage.setItem('refreshInterval', interval);
    

    if (autoRefreshToggle.checked) {
        if (autoRefreshTimer) {
            clearInterval(autoRefreshTimer);
        }
        startAutoRefresh(parseInt(interval));
    }
}

function startAutoRefresh(minutes) {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }
    
    autoRefreshTimer = setInterval(() => {
        if (lastSearchedCity) {
            getWeatherData(lastSearchedCity);
        }
    }, minutes * 60 * 1000);
}


function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? 'flex' : 'none';
}

function showError(message, isSuccess = false) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    if (isSuccess) {
        errorMessage.style.borderLeft = '5px solid #4caf50';
        document.querySelector('.error-message i').className = 'fas fa-check-circle';
        document.querySelector('.error-message i').style.color = '#4caf50';
        document.getElementById('dismissError').style.backgroundColor = '#4caf50';
    } else {
        errorMessage.style.borderLeft = '5px solid #f44336';
        document.querySelector('.error-message i').className = 'fas fa-exclamation-circle';
        document.querySelector('.error-message i').style.color = '#f44336';
        document.getElementById('dismissError').style.backgroundColor = '#f44336';
    }
    
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

document.addEventListener('DOMContentLoaded', initApp);
