'use strict';


class AppPage extends _BaseDOM {
	constructor() {
		super();

		this.bootstrapStyles(true);

		// this.root.appendChild(new AppHeader());
		const main = new ElementFactory('main');
		const contentSlot = new ElementFactory('slot');
		contentSlot.setAttribute(ATTRS.NAME, 'content');
		main.appendChild(contentSlot);
		this.root.appendChild(main);
		this.root.appendChild(new AppFooter());
	}

	connectedCallback() {
        const isLogin = this.getAttribute(ATTRS.TYPE) === 'login';
        const header = this.root.querySelector('app-header');

        if (isLogin && header)
            header.hideLinks();
	}
}

customElements.define('app-page', AppPage);
