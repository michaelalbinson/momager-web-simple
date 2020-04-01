'use strict';

class MomAssetBullet extends MomInputCore {
    constructor(label, name, underlyingData, options) {
        super(label, name, '');
        this.underlying = underlyingData;

        this._getHTMLLabel();

        this.input = new ElementFactory('input');
        this.input.setAttribute(ATTRS.TYPE, 'hidden');
        this.setInputAttributesAndAppend(options);
        this.input.setAttribute(ATTRS.VALUE, this.getID());

        this.render();
    }

    getID() {
        return this.underlying.id;
    }

    getText() {
        throw new Error('Method must be overridden');
    }

    getAssetLocation() {
        throw new Error('Method must be overridden');
    }

    render() {
        const text = this.getText();

        this.bullet = new ElementFactory(elements.DIV, 'asset-bullet');
        this.bullet.appendChild(new ElementFactory(elements.IMG, '', this.getAssetLocation(), text));
        this.bullet.appendChild(new ElementFactory(elements.SPAN, '', text));
        this.inputRoot.appendChild(this.bullet);
    }
}
