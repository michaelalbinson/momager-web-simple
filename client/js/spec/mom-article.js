'use strict';


class MomArticle extends _BaseDOM {
    connectedCallback() {
        this.styles.push('/css/spec/mom-article.css');
        this.bootstrapStyles(true);

        this.parseAttrs();
        this.root.appendChild(new ElementFactory(elements.H1, '', this._title));
        if (this._subtitle)
            this.root.appendChild(new ElementFactory(elements.H4, '', this._subtitle));

        this.root.appendChild(new ElementFactory(elements.IMG, 'hero white-bg', '/assets/topic/' + this._icon, this._alt));

        this.root.appendChild(new ElementFactory(elements.HR));
        this.root.appendChild(new ElementFactory(elements.P, '', this._body));
    }

    parseAttrs() {
        this._title = this.getAttribute('title');
        this._subtitle = this.getAttribute('subtitle');
        this._icon = this.getAttribute('icon');
        this._alt = this.getAttribute('icon-description');
        this._body = this.getAttribute('body');
    }
}

customElements.define('mom-article', MomArticle);
