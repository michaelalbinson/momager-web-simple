'use strict';


class BGFWarningModal extends BGFModal {
    constructor(title, body) {
        super(title, body);
    }
}

customElements.define('warning-modal', BGFWarningModal);
