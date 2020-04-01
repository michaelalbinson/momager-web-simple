'use strict';


class WeatherLookup {
    static getWeather() {
        return new Promise(((resolve, reject) => {
            const weatherData = WeatherLookup.getWeatherCache();
            // if we have a weatherData object and the weather data is not stale (< 3hrs old), return it
            if (typeof weatherData === 'object' && weatherData.date !== '' && moment(weatherData.date).add(1, 'hours').isAfter(moment(), 'hour'))
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
        return WeatherLookup.fetchIP().then((result) => {
            LAT = result.latitude;
            LON = result.longitude;
            city = result.city;
            state = result.region_code;
            IP = result.ip;

            const call = new APICall(APICall.Reg.WEATHER, { LAT, LON, city, state, IP });
            return call.GET();
        }).then((weatherJSON) => {
            let objectifiedData = {};
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
                date: moment().format(),
            };

            WeatherLookup.writeWeatherCache(weatherData);
            return weatherData;
        });
    }

    static fetchIP() {
        const ipCache = WeatherLookup.getIPCache();
        if (ipCache && ipCache.date &&
            moment(ipCache.date).add(6, 'hours').isAfter(moment(), 'hour')) return Promise.resolve(ipCache.data);

        console.log('FETCH TO IP API');
        return fetch('https://api.ipify.org').then((response) => {
            if (!response.ok)
                throw new Error('');

            return response.text();
        }).then((result) => {
            const ipData = {
                data: result,
                date: moment().format(),
            };

            WeatherLookup.writeIPCache(ipData);

            return ipData.data;
        });
    }

    static getWeatherCache() {
        const store = ColdStorage.getStore();
        return store.get(ColdStorage.sections.weather);
    }

    static getIPCache() {
        const store = ColdStorage.getStore();
        return store.get(ColdStorage.sections.IP);
    }

    static writeIPCache(data) {
        const store = ColdStorage.getStore();
        return store.set(ColdStorage.sections.IP, data);
    }

    static writeWeatherCache(data) {
        const store = ColdStorage.getStore();
        store.set('weather', data);
    }
}

export default WeatherLookup;
