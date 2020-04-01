'use strict';


class MomSkillSet extends _BaseDOM {
    connectedCallback() {
        this.styles.push('/css/spec/mom-topic-card.css');
        this.bootstrapStyles(true);

        this.parseAttrs();
        this.root.appendChild(new ElementFactory(elements.H1, '', this._title));
        if (this._subtitle)
            this.root.appendChild(new ElementFactory(elements.H4, '', this._subtitle));

        this.root.appendChild(new ElementFactory(elements.HR));

        const row = new ElementFactory(elements.DIV, 'row align-items');
        _BaseDOM.addChildrenToElement(row, this._articles, (article) => {
            const wrap = new ElementFactory(elements.DIV, 'col-sm-6 col-md-4 col-lg-3');
            wrap.appendChild(new TopicCard(article.title, article.icon, article.iconDescription, this._route + '/' + article.route));
            return wrap;
        });
        this.root.appendChild(row);
    }

    parseAttrs() {
        this._title = this.getAttribute('title');
        this._subtitle = this.getAttribute('subtitle');
        this._icon = this.getAttribute('icon');
        this._iconDescription = this.getAttribute('icon-description');
        this._articles = JSON.parse(this.getAttribute('articles'));
        this._route = this.getAttribute('route') || this._route;
    }
}

customElements.define('mom-skill-set', MomSkillSet);
