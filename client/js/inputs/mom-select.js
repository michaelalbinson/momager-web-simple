'use strict';


class MomSelect extends MomInputCore {
    constructor(label, name, selectOptions, inputOptions) {
        super(label, name);

        this._getHTMLLabel();
         this.input = new ElementFactory('select');
         selectOptions.forEach(option => {
             const htmlOption = new ElementFactory(elements.OPTION);
             htmlOption.setAttribute(ATTRS.VALUE, option.value);
             htmlOption.innerText = option.label;
             if (option.selected)
                 htmlOption.setAttribute(ATTRS.SELECTED, ATTRS.SELECTED);

             if (option.disabled)
                 htmlOption.setAttribute(ATTRS.DISABLED, ATTRS.DISABLED);

             this.input.appendChild(htmlOption);
         });

         this.setInputAttributesAndAppend(inputOptions);
    }

}

customElements.define('mom-select', MomSelect);
