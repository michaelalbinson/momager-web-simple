'use strict';


class BGFErrorModal extends BGFModal {
    constructor(title, body) {
        super(title, body);
    }

    getFooterButtons() {

    }
}

customElements.define('error-modal', BGFErrorModal);
