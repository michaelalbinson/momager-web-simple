'use strict';


class MomDashboard extends _BaseDOM {
    constructor() {
        super();

        this.bootstrapStyles();
        this.styles.push('/css/spec/mom-dashboard.css');
        this.styles.push('/css/spec/mom-topic-card.css');
        this.createStyles();

        this.getSettingsLink();
        this.getTopSection();

        this.root.appendChild(new ElementFactory(elements.H2, '', 'Or Browse:'));
        this.topicSection = new ElementFactory('section');
        this.root.appendChild(this.topicSection);
    }

    connectedCallback() {
        this.parseAttrs();

        const row = new ElementFactory(elements.DIV, 'row align-items');
        _BaseDOM.addChildrenToElement(row, this._topics, (topic) => {
            const wrap = new ElementFactory(elements.DIV, 'col-sm-6 col-md-4 col-lg-3');
            wrap.appendChild(new TopicCard(topic.title, topic.icon, topic.iconDescription, topic.route));
            return wrap;
        });
        this.topicSection.appendChild(row);
    }

    parseAttrs() {
        this._topics = JSON.parse(this.getAttribute('topics'));
    }

    getSettingsLink() {

    }

    getTopSection() {
        this.root.appendChild(new ElementFactory(elements.H1, '', 'Good Afternoon Michael'));
        this.root.appendChild(new MomMainSearch());
        this.root.appendChild(new MomDateLiner());
        this.root.appendChild(new ElementFactory(elements.HR))
    }
}

customElements.define('mom-dashboard', MomDashboard);
