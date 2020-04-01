'use strict';

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


class MomDateLiner extends _BaseDOM {
    constructor() {
        super();

        this.timeLine = new ElementFactory(elements.H3, '', this.getFormattedTime());
        this.timingInterval = setInterval(() => {
            this.updateTime();
        }, 1000);

        this.root.appendChild(this.timeLine);
    }

    updateTime() {
        this.timeLine.innerText = this.getFormattedTime();
    }

    disconnectedCallback() {
        clearInterval(this.timingInterval);
    }

    getFormattedTime() {
        const d = new Date();
        const day = days[d.getDay()];
        let minute = d.getMinutes();
        if (minute < 10)
            minute = "0" + minute;

        let hour = d.getHours();
        let ampm = "AM";
        if( hour > 12 ) {
            hour -= 12;
            ampm = "PM";
        }

        const date = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();

        return `${day} ${month} ${date}, ${year} ${hour}:${minute} ${ampm}`;
    }
}

customElements.define('mom-date-liner', MomDateLiner);
