
// const apiKey = '5bed68c41f33b4444fcbceacb6af008e';

// let place = document.getElementById("place");
// let temp = document.getElementById("temp");
// let desc = document.getElementById("desc");
// let feel = document.getElementById("feel");
// let icon = document.getElementById("icon");
// let days = document.getElementById("days");
// let reloadBtn = document.getElementById("reload");

// //weather
// function showWeather(lat, lon) {
//     // current weather
//     fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
//     .then(res => res.json())
//     .then(data => {
//         place.textContent = data.name + ", " + data.sys.country;
//         temp.textContent = "Temp: " + data.main.temp + "°C";
//         desc.textContent = "Condition: " + data.weather[0].description;
//         feel.textContent = "Feels like: " + data.main.feels_like + "°C";
//         icon.src = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
//     });

//     // forecast
//     fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
//     .then(res => res.json())
//     .then(data => {
//         days.innerHTML = "";
//         for (let i = 0; i < data.list.length; i += 8) {
//             let d = data.list[i];
//             let date = new Date(d.dt * 1000);
//             let name = date.toLocaleDateString("en-US", { weekday: "short" });

//             let div = document.createElement("div");
//             div.className = "day";
//             div.innerHTML = `
//                 <p>${name}</p>
//                 <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png">
//                 <p>${d.main.temp}°C</p>
//             `;
//             days.appendChild(div);
//         }
//     });
// }

// //live location
// function getLocation() {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(pos => {
//             showWeather(pos.coords.latitude, pos.coords.longitude);
//         }, () => {
//             place.textContent = "Location not available";
//         });
//     } else {
//         place.textContent = "Geolocation not supported";
//     }
// }









const API_KEY = '5bed68c41f33b4444fcbceacb6af008e';

// DOM refs
const elPlace    = document.getElementById('place');
const elTemp     = document.getElementById('temp');
const elDesc     = document.getElementById('desc');
const elFeel     = document.getElementById('feel');
const elHumidity = document.getElementById('humidity');
const elWind     = document.getElementById('wind');
const elIcon     = document.getElementById('icon');
const elDays     = document.getElementById('days');
const elReload   = document.getElementById('reload');
const elOverlay  = document.getElementById('loading-overlay');

function setLoading(on) {
  if (on) {
    elOverlay.classList.remove('hidden');
    elReload.classList.add('spinning');
  } else {
    elOverlay.classList.add('hidden');
    elReload.classList.remove('spinning');
  }
}

async function showWeather(lat, lon) {
  setLoading(true);

  try {
    const [cur, fcast] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(r => r.json()),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`).then(r => r.json())
    ]);

    if (cur.cod !== 200) throw new Error(cur.message || 'API error');

    // Current conditions
    elPlace.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      ${cur.name}, ${cur.sys.country}`;

    elTemp.textContent     = Math.round(cur.main.temp);
    elDesc.textContent     = cur.weather[0].description;
    elFeel.textContent     = `Feels ${Math.round(cur.main.feels_like)}°`;
    elHumidity.textContent = `${cur.main.humidity}% RH`;
    elWind.textContent     = `${Math.round(cur.wind.speed * 3.6)} km/h`;
    elIcon.src = `https://openweathermap.org/img/wn/${cur.weather[0].icon}@2x.png`;
    elIcon.alt = cur.weather[0].description;

    // 5-day forecast (every 8th = ~24h apart)
    elDays.innerHTML = '';
    const seen = new Set();
    for (const item of fcast.list) {
      const d    = new Date(item.dt * 1000);
      const key  = d.toDateString();
      if (seen.has(key)) continue;
      seen.add(key);
      if (seen.size > 5) break;

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const card = document.createElement('div');
      card.className = 'day-card';
      card.innerHTML = `
        <div class="day-name">${dayName}</div>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}">
        <div class="day-temp">${Math.round(item.main.temp)}°</div>
        <div class="day-lo">${Math.round(item.main.temp_min)}° / ${Math.round(item.main.temp_max)}°</div>
      `;
      elDays.appendChild(card);
    }

  } catch (err) {
    elTemp.textContent = 'ERR';
    elDesc.textContent = err.message || 'Could not load weather.';
    elPlace.innerHTML  = '—';
    console.error('[Nimbus]', err);
  } finally {
    setLoading(false);
  }
}

function getLocation() {
  setLoading(true);
  if (!navigator.geolocation) {
    setLoading(false);
    elDesc.textContent = 'Geolocation not supported by this browser.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos  => showWeather(pos.coords.latitude, pos.coords.longitude),
    ()   => {
      setLoading(false);
      elDesc.textContent = 'Location access denied — please allow and refresh.';
    }
  );
}

elReload.addEventListener('click', getLocation);
getLocation();
// // refresh
// reloadBtn.addEventListener("click", getLocation);

// getLocation();
