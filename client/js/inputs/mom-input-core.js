'use strict';


class MomInputCore extends HTMLElement {
    constructor(label, name, placeholder, displayLimitNextLine) {
        super();

        const inputDivClass  = displayLimitNextLine ? 'form-group textarea' : 'form-group';
        this.inputRoot = new ElementFactory(elements.DIV, inputDivClass);

        this.labelText = label;
        this.name = name;
        this.placeholder = placeholder;

        // by default an input's validation is just that it has a value
        this.validationFn = () => !!this.getValue();

        this.displayLimitNextLine = !!displayLimitNextLine;

        this.appendChild(this.inputRoot);
    }

    _getHTMLLabel() {
        this.label = new ElementFactory(elements.LABEL, '', this.labelText);
        this.label.setAttribute(ATTRS.FOR, this.name);
        this.inputRoot.appendChild(this.label);
    }

    setInputAttributesAndAppend(options) {
        this.input.setAttribute(ATTRS.ID, this.name);
        this.input.setAttribute(ATTRS.NAME, this.name);

        if (this.placeholder)
            this.input.setAttribute(ATTRS.PLACEHOLDER, this.placeholder);

        if (options.value) {
            if (typeof options.value === 'function')
                this.input.setAttribute(ATTRS.VALUE, options.value());
            else
                this.input.setAttribute(ATTRS.VALUE, options.value);
        }

        if (options.readOnly)
            this.input.setAttribute(ATTRS.READ_ONLY, ATTRS.READ_ONLY);

        if (options.validationFn)
            this.validationFn = options.validationFn;

        this.inputRoot.appendChild(this.input);

        if (options.limit) {
            this.limit = options.limit;
            this.appendLimitWidget();
        }

        this.input.addEventListener(EVENTS.CHANGE, () => {
            _BaseDOM.invokeEvent(MomInputCore.CHANGE_EVENT, this, {value: this.getValue()});
        });
    }

    appendLimitWidget() {
        this.limitWidget = new LimitWidget(this.limit, this.input.value.length || 0, this.displayLimitNextLine);

        this.input.addEventListener(EVENTS.KEY_UP, () => {
            this.limitWidget.updateCount(this.input.value.length)
        });

        this.input.addEventListener(EVENTS.FOCUS, () => {
            this.limitWidget.setFocused(true);
        });

        this.input.addEventListener(EVENTS.BLUR, () => {
            this.limitWidget.setFocused(false);
        });

        this.inputRoot.appendChild(this.limitWidget);
    }

    getValue() {
        return this.input.value;
    }

    getName() {
        return this.input.getAttribute(ATTRS.NAME);
    }

    validate() {
        return true;
    }
}

MomInputCore.TYPES = {
    SELECT: 'select',
    USER: 'user',
    COMPANY: 'company',
    TEXT_AREA: 'textarea'
};

MomInputCore.CHANGE_EVENT = 'FORM-INPUT#CHANGE';
