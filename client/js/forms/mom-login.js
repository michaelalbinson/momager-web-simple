'use strict';

class MomLogin extends MomForm {
    constructor() {
        super();

        this.getSection('Sign In')
            .addInput('email', 'Email Address', 'email', {clean: true})
            .addInput('password', 'Password', 'secret', {clean: true})
            .attach();

        this.getButtonSection()
            .setSubmitButtonText('Sign In')
            .attach();
    }
}

customElements.define('mom-login', MomLogin);
