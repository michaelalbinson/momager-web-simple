'use strict';

const headerLinks = [
	{ title: 'Gurus', link: '/gurus' },
	{ title: 'Founders', link: '/founders' },
	{ title: 'Fund Companies', link: '/companies' },
	{ title: 'Account', link: '/account' },
];


class AppHeader extends _BaseDOM {
	constructor() {
        super();

        this.bootstrapStyles();
        this.styles.push('/css/app-header.css');
        this.createStyles();

        const header = new ElementFactory('header');
        const heroLogo = new ElementFactory(elements.DIV, 'hero-logo');
        // heroLogo.appendChild(new IconLinkElement('/assets/bgf.png', '/', 'Breakaway Growth Fund logo', 'bgf-header-img', 'bgf-header-img-wrap'));
        header.appendChild(heroLogo);

		const links = new ElementFactory(elements.DIV, 'nav-links');
		_BaseDOM.addChildrenToElement(links, headerLinks, (el) => {
			return new ElementFactory(elements.A, '', el.link, el.title);
		});

		header.appendChild(links);
		this.root.appendChild(header);

		let headerPush = new ElementFactory(elements.DIV, 'header-push');
		this.root.appendChild(headerPush);
	}


	hideLinks() {
		this.root.querySelector('.nav-links').style.display = 'none';
	}
}

customElements.define('app-header', AppHeader);
