'use strict';


/**
 *
 */
class MomForm extends _BaseDOM {
    /**
     *
     * @param readOnly {boolean=}
     */
    constructor(readOnly) {
        super();

        this.bootstrapStyles();
        this.styles.push('/css/input/form.css');
        this.styles.push('/css/input/input.css');
        this.createStyles();

        this.readOnly = !!readOnly;
        this.sections = [];

        this.form = new ElementFactory('form');
        this.form.setAttribute('method', 'post');
        this.root.appendChild(this.form);
    }

    /**
     * Add a new section to the form, returns the new section
     * @param title {string=}
     * @return {MomFormSection}
     */
    getSection(title) {
        const section = new MomFormSection(MomFormSection.TYPES.INPUT, title);
        this._addSection(section);
        return section;
    }

    /**
     * Add a section with buttons into the form, returns the new section
     * @return {MomFormSection}
     */
    getButtonSection() {
        const section = new MomFormSection(MomFormSection.TYPES.BUTTON, '', this._submitWrapper.bind(this));
        this._addSection(section);
        return section;
    }

    _addSection(section) {
        this.sections.push(section);
        this.form.appendChild(section);
    }

    serializeData() {
        const data = {};
        this.sections.forEach(section => {
            const inputs = section.getNativeInputs();
            inputs.forEach(input => {
                if (input.getValue && input.getName)
                    data[input.getName()] = input.getValue();
            });
        });

        return data;
    }

    /**
     * Wrap the call to submit so that we can pass the form data
     * @private
     */
    _submitWrapper(event) {
        // TODO: accessible method
        if (!this.validate())
            return event.preventDefault();

        this.submit(this.serializeData(), event);
    }

    /**
     * Overridable method
     * @param data {object} JSON representation of validated form
     * @param event {Event} click event fired on the button (must prevent default!)
     */
    submit(data, event) {

    }

    /**
     *
     * @return {boolean}
     */
    validate() {
        return this.sections.reduce((prevValue, section) => {
            return prevValue && section.validate();
        }, true)
    }

    static getCurrentDateString() {
        return new Date().toISOString().slice(0, new Date().toISOString().indexOf('T'));
    }
}

customElements.define('mom-form', MomForm);
