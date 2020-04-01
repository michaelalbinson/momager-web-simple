'use strict';


class MomInput extends MomInputCore {
    /**
     *
     * @param type {string}
     * @param label {string}
     * @param name {string}
     * @param placeholder {string=}
     * @param options {{value: string, validationFn: function, limit: number}}
     */
    constructor(type, label, name, placeholder, options) {
        super(label, name, placeholder, false);

        this._getHTMLLabel();

        this.input = new ElementFactory('input', 'distinct');
        this.input.setAttribute(ATTRS.TYPE, type);
        if (options && options.clean) {
            this.input.setAttribute(ATTRS.PLACEHOLDER, label);
            this.label.classList.add('sr-only');
        }


        this.setInputAttributesAndAppend(options);
    }

    validate() {
        let belowLimit = true;
        if (this.limitWidget)
            belowLimit = this.limitWidget.isBelowLimit();

        return belowLimit && this.validationFn(this.input);
    }
}

customElements.define('mom-input', MomInput);
