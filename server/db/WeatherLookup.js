let config = require('../config/index');

fetch(`https://api.darksky.net/forecast/${config['WEATHER-API-KEY']}/${LAT},${LON}`).then((res) => {
    return res.json();
}).then((weatherJSON) => {
    const weatherData = {
        latitude: LAT,
        longitude: LON,
        city,
        IP,
        '5-day': weatherJSON.daily.data,
        current: weatherJSON.currently,
        date: moment().format(),
    };
    resolve(weatherData);
});
