class TopicCard extends HTMLElement {
    constructor(title, icon, alt, route) {
        super();

        this._title = title;
        this._icon = icon;
        this._alt = alt;
        this._route = route;
    }

    connectedCallback() {
        this.parseAttrs();

        this.wrap = new ElementFactory(elements.DIV, 'tile-card');
        this.card = new ElementFactory(elements.DIV, 'card');
        this.link = new ElementFactory(elements.A, '', '/skill/' + this._route);
        this.link.appendChild(new ElementFactory(elements.IMG, 'hero', '/assets/topic/' + this._icon, this._alt));
        this.link.appendChild(new ElementFactory(elements.H4, '', this._title));
        this.card.appendChild(this.link);
        this.wrap.appendChild(this.card);
        this.appendChild(this.wrap);
    }

    parseAttrs() {
        this._route = this.getAttribute('route') || this._route;
        this._title = this.getAttribute('title') || this._title;
        this._icon = this.getAttribute('image') || this._icon;
        this._alt = this.getAttribute('alt') || this._alt;
    }
}

customElements.define('mom-topic-card', TopicCard);
