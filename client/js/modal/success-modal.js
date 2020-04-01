'use strict';


class BGFSuccessModal extends BGFModal {
    constructor(title, body) {
        super(title, body);
    }

    getFooterButtons() {

    }
}

customElements.define('success-modal', BGFSuccessModal);
