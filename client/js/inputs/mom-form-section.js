'use strict';


class MomFormSection extends HTMLElement {
    /**
     * Create a BGFFormSection builder instance
     * @param type {MomFormSection.TYPES}
     * @param title {null|string=}
     * @param onSubmit {function}
     */
    constructor(type, title, onSubmit) {
        super();

        this.type = type;
        this.title = title;
        this.inputs = [];
        this.submitFn = onSubmit;
        this.submitButtonText = 'Submit';

        this.section = new ElementFactory(elements.SECTION, '');
        if (title)
            this.section.appendChild(new ElementFactory(elements.H2, '', title));
    }

    /**
     *
     * @param type
     * @param label
     * @param name
     * @param options
     * @return {MomFormSection}
     */
    addInput(type, label, name, options) {
        let input = MomFormSection._getInput(type, label, name, options);
        this.inputs.push(input);
        this.section.appendChild(input);
        return this;
    }

    /**
     *
     * @param text {string}
     * @param cssClass {string}
     * @param action {function}
     * @return {MomFormSection}
     */
    addButton(text, cssClass, action) {
        const btnClass = cssClass ? 'btn-' + cssClass : '';
        const btn = new ElementFactory(elements.BUTTON, 'btn ' + btnClass, text);
        btn.addEventListener(EVENTS.CLICK, action);

        this.section.appendChild(btn);

        return this;
    }

    /**
     * Add a link to a button section
     * @param text {string}
     * @param cssClass {string}
     * @param href {string}
     * @return {MomFormSection}
     */
    addLink(text, cssClass, href) {
        const btnClass = cssClass ? 'btn-' + cssClass : '';
        const link = new ElementFactory(elements.A, 'btn ' + btnClass, href, text);
        this.section.appendChild(link);
        return this;
    }

    /**
     * Attach the section to the parent
     */
    attach() {
        if (this.type === MomFormSection.TYPES.BUTTON)
            this.addButton(this.submitButtonText, 'primary', this.submitFn);

        // don't attach buttons if the form is read-only
        if (this.readOnly && this.type === MomFormSection.TYPES.BUTTON)
            return;

        this.appendChild(this.section);
    }

    setSubmitButtonText(title) {
        if (this.type !== MomFormSection.TYPES.BUTTON)
            return this;

        this.submitButtonText = title;
        return this;
    }

    /**
     * Validate the form section
     * @return {boolean}
     */
    validate() {
        return this.inputs.reduce((prev, input) => {
            return prev && input.validate();
        }, true);
    }

    getNativeInputs() {
        return this.inputs;
    }

    /**
     *
     * @param type {string}
     * @param label {string}
     * @param name {string}
     * @param options {object}
     * @return {MomInputCore}
     */
    static _getInput(type, label, name, options) {
        options = options || {};

        if (type === MomInputCore.TYPES.TEXT_AREA)
            return new MomTextArea(label, name, options.placeholder, options);
        else if (type === MomUserInput.TYPES.USER)
            return new MomUserInput(label, name, options.user, options);
        else if (type === MomUserInput.TYPES.SELECT)
            return new MomSelect(label, name, options.options, options);
        else if (type === MomUserInput.TYPES.COMPANY)
            return new MomCompanyInput(label, name, options.company, options);

        return new MomInput(type, label, name, options.placeholder, options);
    }

}

MomFormSection.TYPES = {
    INPUT: 'input',
    BUTTON: 'button'
};

customElements.define('mom-form-section', MomFormSection);
