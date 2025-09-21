
const apiKey = '5bed68c41f33b4444fcbceacb6af008e';

let place = document.getElementById("place");
let temp = document.getElementById("temp");
let desc = document.getElementById("desc");
let feel = document.getElementById("feel");
let icon = document.getElementById("icon");
let days = document.getElementById("days");
let reloadBtn = document.getElementById("reload");

//weather
function showWeather(lat, lon) {
    // current weather
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
        place.textContent = data.name + ", " + data.sys.country;
        temp.textContent = "Temp: " + data.main.temp + "°C";
        desc.textContent = "Condition: " + data.weather[0].description;
        feel.textContent = "Feels like: " + data.main.feels_like + "°C";
        icon.src = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
    });

    // forecast
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
        days.innerHTML = "";
        for (let i = 0; i < data.list.length; i += 8) {
            let d = data.list[i];
            let date = new Date(d.dt * 1000);
            let name = date.toLocaleDateString("en-US", { weekday: "short" });

            let div = document.createElement("div");
            div.className = "day";
            div.innerHTML = `
                <p>${name}</p>
                <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png">
                <p>${d.main.temp}°C</p>
            `;
            days.appendChild(div);
        }
    });
}

//live location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            showWeather(pos.coords.latitude, pos.coords.longitude);
        }, () => {
            place.textContent = "Location not available";
        });
    } else {
        place.textContent = "Geolocation not supported";
    }
}

// refresh
reloadBtn.addEventListener("click", getLocation);

getLocation();
