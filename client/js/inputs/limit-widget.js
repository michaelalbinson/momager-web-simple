'use strict';


class LimitWidget extends _BaseDOM {
    constructor(limit, current, displayNextLine) {
        super();
        this.styles.push('/css/input/limit-widget.css');
        this.createStyles();

        this.currentCount = current;
        this.limitCount = limit;

        this.wrap = new ElementFactory(elements.DIV, 'limit-counter');
        if (displayNextLine)
            this.wrap.classList.add('next-line');

        this.current = new ElementFactory(elements.SPAN, '', String(current));
        this.divisor = new ElementFactory(elements.SPAN, '', '/');
        this.limit = new ElementFactory(elements.SPAN, '', limit);

        this.wrap.appendChild(this.current);
        this.wrap.appendChild(this.divisor);
        this.wrap.appendChild(this.limit);
        this.root.appendChild(this.wrap);
    }

    updateCount(current) {
        this.currentCount = current;
        this.current.innerText = current;
        if (this.isBelowLimit())
            this.wrap.classList.remove('above');
        else
            this.wrap.classList.add('above');

    }

    setFocused(isFocused) {
        if (isFocused)
            this.wrap.classList.add('focused');
        else
            this.wrap.classList.remove('focused');
    }

    isBelowLimit() {
        return this.currentCount <= this.limitCount;
    }
}

customElements.define('limit-widget', LimitWidget);
