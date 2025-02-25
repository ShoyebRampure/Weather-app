# Weather Dashboard

A modern, responsive weather application that provides real-time weather information with a sleek, interactive interface.


## Features

- **Current Weather Data**: Get detailed current weather information for any location
- **5-Day Forecast**: View upcoming weather conditions for the next 5 days
- **Hourly Forecast**: Check hour-by-hour weather predictions
- **Air Quality Index**: Monitor air quality with a visual indicator
- **Geolocation Support**: Get weather for your current location with one click
- **Recent Searches**: Quickly access your previously searched locations
- **Dark/Light Mode**: Toggle between themes based on your preference
- **Unit Conversion**: Switch between metric (°C, m/s) and imperial (°F, mph) units
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dynamic Backgrounds**: Weather-appropriate visual effects that change based on conditions
- **Sun Position Tracker**: Visual representation of the sun's position throughout the day
- **Customizable Settings**: Control animations, background effects, and data refresh intervals

## Technologies Used

- HTML5
- CSS3 with custom animations and responsive design
- Vanilla JavaScript
- OpenWeatherMap API
- Font Awesome icons
- Google Fonts

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/ShoyebRampure/Weather-app.git
   ```

2. Navigate to the project directory:
   ```
   cd Weather-app
   ```

3. Open `index.html` in your browser or use a local development server.

## API Key Setup

The app uses OpenWeatherMap API. By default, it includes a sample API key for demonstration purposes.

For production use:
1. Create a free account at [OpenWeatherMap](https://openweathermap.org/)
2. Generate your API key from the dashboard
3. Replace the API_KEY constant in `script.js` with your own key:

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
```

## Usage

- **Search for a City**: Enter a city name in the search bar and press Enter or click the search icon
- **Use Current Location**: Click the "Use my location" button to get weather for your current position
- **Toggle Units**: Switch between Celsius/meters per second and Fahrenheit/miles per hour
- **Change Theme**: Toggle between light and dark mode using the sun/moon switch
- **Access Settings**: Click the gear icon to customize animations, background effects, and auto-refresh options
- **View Recent Searches**: Click on any city in the recent searches list to quickly view its weather

## Customization Options

Access the settings modal to customize:

- **Animations**: Toggle UI animations on/off
- **Background Effects**: Enable/disable dynamic weather backgrounds
- **Auto Refresh**: Set weather data to automatically update at intervals (5 minutes to 1 hour)
- **Search History**: Clear your recent searches list

## Browser Compatibility

The Weather Dashboard is compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Improvements

- Weather maps integration
- Weather alerts and notifications
- Historical weather data
- Detailed precipitation forecasts
- Location favorites/bookmarks
- PWA support for offline access

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather data API
- [Font Awesome](https://fontawesome.com/) for the icons
- [Google Fonts](https://fonts.google.com/) for the typography
