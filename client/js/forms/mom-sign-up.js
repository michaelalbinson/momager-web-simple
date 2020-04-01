'use strict';


class MomSignUp extends MomForm {
    constructor(props) {
        super(props);

        this.getSection('Let me get some basic information from you')
            .addInput('text', 'First Name*', 'first-name', {clean: true})
            .addInput('text', 'Last Name*', 'last-name', {clean: true})
            .attach();

        this.getSection('What\'s your birthday?')
            .addInput('date', 'Date of Birth', 'dob', {clean: true})
            .attach();

        this.getSection('What\'s your address?')
            .addInput('text', 'Address Line 1*', 'addr1', {clean: true})
            .addInput('text', 'Address Line 2', 'addr2', {clean: true})
            .addInput('text', 'City*', 'city', {clean: true})
            .addInput('text', 'State/Province*', 'state', {clean: true})
            .addInput('text', 'Country*', 'country', {clean: true})
            .addInput('text', 'Postal Code*', 'postal', {clean: true})
            .attach();

        this.getSection('Set your email and password')
            .addInput('email', 'Email*', 'email', {clean: true})
            .addInput('password', 'Password', 'password', {clean: true})
            .attach();

        this.getButtonSection()
            .addLink('Back', 'default', '/')
            .setSubmitButtonText('Continue')
            .attach();
    }
}

customElements.define('mom-sign-up', MomSignUp);
