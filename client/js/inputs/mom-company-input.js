'use strict';


class MomCompanyInput extends MomAssetBullet {
    /**
     *
     * @param label {string}
     * @param name {string}
     * @param company {function}
     * @param options {object}
     */
    constructor(label, name, company, options) {
        const companyObject = company();
        super(label, name, companyObject, options);
    }

    getID() {
        return this.underlying.id;
    }

    getText() {
        return this.underlying.name
    }

    getAssetLocation() {
        return '/assets/companies/' + this.underlying.logoURL;
    }
}

customElements.define('mom-company-input', MomCompanyInput);
