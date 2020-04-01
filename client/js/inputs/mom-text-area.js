'use strict';


class MomTextArea extends MomInputCore {
    constructor(label, name, placeholder, options) {
        super(label, name, placeholder, true);

        this._getHTMLLabel();
        this.input = new ElementFactory('textarea');
        this.setInputAttributesAndAppend(options);
    }
}

customElements.define('mom-text-area', MomTextArea);
