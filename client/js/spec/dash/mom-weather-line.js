'use strict';

class MomWeatherLine extends _BaseDOM {
    constructor() {
        super();

        const state = {
            city: 'Napa',
            icon: 'partly-cloudy-day',
            temp: 58
        };

        this.cityDiv = new ElementFactory(elements.DIV, 'd-inline-block', `${state.city} |`);
        this.weatherImg = new ElementFactory(elements.IMG, '', `./assets/weather/${state.icon}.png`, );
        this.tempDiv = new ElementFactory(elements.DIV, '', `${state.icon}&deg;F`);

        this.root.appendChild(this.cityDiv);
        this.root.appendChild(this.weatherImg);
        this.root.appendChild(this.tempDiv);
    }

    connectedCallback() {
        this.checkWeather();
        // check if update required every minute
        this.timingInterval = setInterval(() => {
            this.checkWeather();
        }, 60000);
    }

    disconnectedCallback() {
        clearInterval(this.timingInterval);
    }

    checkWeather() {
        WeatherLookup.getWeather().then((weather) => {
            const weatherToday = weather.current;
            this.setState({
                icon: weatherToday.icon,
                temp: Math.round(weatherToday.temperature),
                city: weather.city,
            });
        });
    }
}

customElements.define('mom-weather-line', MomWeatherLine);
