'use strict';


class MomUserInput extends MomAssetBullet {
    constructor(label, name, user, options) {
        const userObject = user();
        super(label, name, userObject, '', options);
    }

    getID() {
        return this.underlying.id;
    }

    getText() {
        return this.underlying.name;
    }

    getAssetLocation() {
        const prefix = this.underlying.type === 'guru' ? '/assets/gurus/' : '/assets/founders/';
        return prefix + this.underlying.profileURL;
    }
}

customElements.define('mom-user-input', MomUserInput);
