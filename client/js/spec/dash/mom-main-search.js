'use strict';

class MomMainSearch extends _BaseDOM {
    constructor() {
        super();

        this.styles.push('css/input/input.css');
        this.styles.push('css/spec/mom-main-search.css');
        this.bootstrapStyles(true);

        this.search = new ElementFactory('input', 'main-search');
        this.search.setAttribute(ATTRS.PLACEHOLDER, 'What can I help with today?');
        this.search.addEventListener(EVENTS.CHANGE, (e) => {
            _BaseDOM.invokeEvent('MAIN-SEARCH#CHANGE', this, {value: e.target.value});
        });

        this.root.appendChild(this.search);
    }
}

customElements.define('mom-main-search', MomMainSearch);
