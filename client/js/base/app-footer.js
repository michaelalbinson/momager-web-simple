'use strict';


class AppFooter extends _BaseDOM {
	constructor() {
		super();

        const footerMeta = [
            { title: 'About', link: '/about' },
            { title: 'Contact', link: '/contact' }
        ];

		this.bootstrapStyles();
		this.styles.push('/css/spec/app-footer.css');
		this.createStyles();

		const footer = new ElementFactory('footer');
		const p1 = new ElementFactory(elements.P, '', 'Copyright 2020 - All Rights Reserved.');
		footer.appendChild(p1);

		_BaseDOM.addChildrenToElement(footer, footerMeta, (el) => {
			let p = new ElementFactory(elements.P);
			p.appendChild(new ElementFactory(elements.A, '', el.link, el.title));
			return p;
		});

		this.root.appendChild(footer);
	}
}

customElements.define('app-footer', AppFooter);
