'use strict';


class WeatherLookup {
    static getWeather() {
        return new Promise(((resolve, reject) => {
            const weatherData = WeatherLookup.getWeatherCache();
            // if we have a weatherData object and the weather data is not stale (< 3hrs old), return it
            if (typeof weatherData === 'object' && weatherData.date !== '' && new Date(weatherData.date).addHours(3) > new Date())
                return resolve(weatherData);

            WeatherLookup.fetchWeather().then((retrievedData) => {
                resolve(retrievedData);
            }).catch((error) => {
                // We'll resolve if we have a valid weather dataset, but reject if we don't have any data
                if (typeof weatherData === 'object')
                    resolve(weatherData);
                else
                    reject(error);
            });
        }));
    }

    // INTERNAL ONLY
    static fetchWeather() {
        let LAT = null;
        let LON = null;
        let city = null;
        let state = null;
        let IP = null;
        return WeatherLookup.getGeoLocation().then((position) => {
            LAT = position.coords.latitude;
            LON = position.coords.longitude;

            return requestPromise('/plumbing/weather', { LAT, LON }, request.METHODS.GET);
        }).then((weatherJSON) => {
            let objectifiedData;
            try {
                objectifiedData = JSON.parse(weatherJSON.data);
            } catch (e) {
                objectifiedData = weatherJSON.data;
            }

            const weatherData = {
                latitude: LAT,
                longitude: LON,
                city,
                IP,
                '5-day': objectifiedData.daily.data,
                current: objectifiedData.currently,
                date: new Date(),
            };

            WeatherLookup.writeWeatherCache(weatherData);
            return weatherData;
        }).catch((err) => {
            console.error('Unable to retrieve weather data:');
            console.error(err);
        });
    }

    static getGeoLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation)
                return reject('Geolocation is not available');

            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position);
            }, () => {
                reject('Geolocation is not available');
            });
        });
    }

    static getWeatherCache() {
        const store = new ColdStorage();
        return store.get(ColdStorage.sections.weather);
    }

    static getIPCache() {
        const store = new ColdStorage();
        return store.get(ColdStorage.sections.IP);
    }

    static writeIPCache(data) {
        const store = new ColdStorage();
        return store.set(ColdStorage.sections.IP, data);
    }

    static writeWeatherCache(data) {
        const store = new ColdStorage();
        store.set(ColdStorage.sections.weather, data);
    }
}
