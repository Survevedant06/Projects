import React, { useState } from 'react';

const api = {
  key: "33a69e8c3d891ac3692e71698034ae67",
  base: "https://api.openweathermap.org/data/2.5/"
};

function App() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = evt => {
    if (evt.key === "Enter" && query.trim() !== '') {
      setLoading(true);
      setError('');
      fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
        .then(res => res.json())
        .then(result => {
          setLoading(false);
          if (result.cod === 200 || result.main) {
            setWeather(result);
            setQuery('');
          } else {
            setError('City not found. Please try again.');
            setWeather({});
          }
        })
        .catch(() => {
          setLoading(false);
          setError('Something went wrong. Check your connection.');
        });
    }
  };

  const dateBuilder = (d) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const days = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const isWarm = typeof weather.main !== "undefined" && weather.main.temp > 16;
  const hasWeather = typeof weather.main !== "undefined";

  return (
    <div className={hasWeather ? (isWarm ? 'app warm' : 'app') : 'app'}>
      <main>
        <div className="container">

          {/* ── Search Box ── */}
          <div className="search-box">
            <input
              type="text"
              className="search-bar"
              placeholder="Search for a city..."
              onChange={e => setQuery(e.target.value)}
              value={query}
              onKeyPress={search}
            />
          </div>

          {/* ── Error Message ── */}
          {error && (
            <div className="welcome-message">
              <h2>Oops!</h2>
              <p>{error}</p>
            </div>
          )}

          {/* ── Loading State ── */}
          {loading && (
            <div className="welcome-message">
              <h2>Fetching weather…</h2>
              <p>Hang tight for a moment.</p>
            </div>
          )}

          {/* ── Weather Result Card ── */}
          {hasWeather && !loading && !error && (
            <div className="result-container">

              {/* Location + Date */}
              <div className="location-box">
                <div className="location">
                  {weather.name}, {weather.sys.country}
                </div>
                <div className="date">{dateBuilder(new Date())}</div>
              </div>

              {/* Temperature + Condition */}
              <div className="weather-box">
                <div className="temp">
                  {Math.round(weather.main.temp)}
                </div>
                <div className="weather">{weather.weather[0].main}</div>
              </div>

              {/* Extra Stats */}
              <div className="extra-stats">
                <div className="stat">
                  <span className="stat-label">Humidity</span>
                  <span className="stat-value">{weather.main.humidity}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Feels Like</span>
                  <span className="stat-value">{Math.round(weather.main.feels_like)}°C</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Wind</span>
                  <span className="stat-value">{Math.round(weather.wind.speed)} km/h</span>
                </div>
              </div>

            </div>
          )}

          {/* ── Welcome Screen (initial state) ── */}
          {!hasWeather && !loading && !error && (
            <div className="welcome-message">
              <h2>Discover the Weather</h2>
              <p>Enter a city name and press Enter to get started.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
