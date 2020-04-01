'use strict';


class IconLinkElement extends _BaseDOM {
	constructor(source, link, alt, imageClassList, hoverClass, target) {
		super();

		this.styles.push('/css/spec/icon-link.css');
		this.createStyles();

		this.source = source;
		this.link = link;
		this.alt = alt;
		this._classList = imageClassList;
		this.hoverClass = hoverClass;

		const imgClass = this._classList || this.getAttribute(ATTRS.CLASS) || 'header-icon';

		const div = new ElementFactory(elements.SPAN);
		this.a = new ElementFactory(elements.A, '', this.link || this.getAttribute(ATTRS.HREF));
		if (target)
			this.a.setAttribute(ATTRS.TARGET, target);

		this.a.addEventListener(EVENTS.CLICK, this.emitClick.bind(this));

		this.imgWrap = new ElementFactory(elements.DIV);
		this.imgWrap.classList.add('icon-link');
		if (imgClass)
			this.imgWrap.classList.add(imgClass);

		if (this.hoverClass)
			this.imgWrap.classList.add(this.hoverClass);

		const imgSrc = this.source || this.getAttribute(ATTRS.SRC);
		const imgAlt = this.alt || this.getAttribute(ATTRS.ALT);
		this.img = new ElementFactory(elements.IMG, imgClass, imgSrc, imgAlt);
		this.imgWrap.appendChild(this.img);
		this.a.appendChild(this.imgWrap);

		div.appendChild(this.a);
		this.root.appendChild(div);
	}

	emitClick() {
		_BaseDOM.invokeEvent('ICON_LINK#CLICK', this);
	}
}

customElements.define('icon-link', IconLinkElement);
