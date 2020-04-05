'use strict';


class ColdStorage {
    constructor() {
        this.store = window.localStorage;
    }

    set(key, value) {
        if (typeof value === 'object')
            value = JSON.stringify(value);

        this.store.setItem(key, value);
        return value;
    }

    get(key) {
        let value = this.store.getItem(key);
        if (typeof value === 'string') {
            try {
                value = JSON.parse(value);
            } catch {}
        }

        return value;
    }

    remove(key) {
        this.store.removeItem(key);
    }

    // TODO: lol DANGER ZONE
    hardReset() {
        this.store.clear();
    }
}

ColdStorage.sections = {
    userData: 'userData',
    userSettings: 'userSettings',
    weather: 'weather',
    budget: 'budget',
    hasAccount: 'hasAccount',
    IP: 'IP',
    forgot: 'forgot',
};
