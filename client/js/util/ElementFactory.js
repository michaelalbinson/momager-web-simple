'use strict';


(function(win) {
    const elements = {
        DIV: 'div',
        SPAN: 'span',
        A: 'a',
        IMG: 'img',
        SECTION: 'section',
        BUTTON: 'button',
        P: 'p',
        MAIN: 'main',
        HR: 'hr',
        H1: 'h1',
        H2: 'h2',
        H3: 'h3',
        H4: 'h4',
        H5: 'h5',
        H6: 'h6',
        TH: 'th',
        TD: 'td',
        TR: 'tr',
        THEAD: 'thead',
        TBODY: 'tbody',
        TABLE: 'table',
        LABEL: 'label',
        UL: 'ul',
        OL: 'ol',
        LI: 'li',
        BR: 'br',
        FORM: 'form',

        SELECT: 'select',
        OPTION: 'option'
    };

    const INPUTS = {
        INPUT: 'input',
        TEXTAREA: 'textarea'
    };

    const ATTRS = {
        ID: 'id',
        FOR: 'for',
        HREF: 'href',
        ROLE: 'role',
        SRC: 'src',
        ALT: 'alt',
        REL: 'rel',
        CLASS: 'class',
        TITLE: 'title',
        TYPE: 'type',
        NAME: 'name',
        TABINDEX: 'tabindex',
        LINK: 'link',
        VALUE: 'value',
        TARGET: 'target',
        DISABLED: 'disabled',
        SELECTED: 'selected',
        PLACEHOLDER: 'placeholder',
        READ_ONLY: 'readonly',

        ARIA_ROLE: 'aria-role',
        ARIA_LABEL: 'aria-label',
        ARIA_HIDDEN: 'aria-hidden'
    };

    const EVENTS = {
        CLICK: 'click',
        CHANGE: 'change',
        LOAD: 'load',
        FOCUS: 'focus',
        BLUR: 'blur',

        KEY_UP: 'keyup',
        KEY_DOWN: 'keydown',

        MOUSE_OVER: 'mouseover',
        MOUSE_LEAVE: 'mouseleave',
    };

    const textTypes = [
        elements.TH, elements.TD,
        elements.H1, elements.H2, elements.H3, elements.H4, elements.H5, elements.H6,
        elements.LI, elements.SPAN, elements.P, elements.BUTTON, elements.LABEL, elements.DIV
    ];

    const createElement = (e) => { return document.createElement(e) };

    /**
     * Helper factory to construct html elements for functionally-generated custom elements
     * @param type {string}
     * @param classList {string=}
     * @param href {string=}
     * @param alt {string=}
     * @param options {object=}
     * @return {HTMLElement}
     * @constructor
     */
    function ElementFactory(type, classList, href, alt, options) {
        let element = createElement(type);

        if (classList)
            element.setAttribute(ATTRS.CLASS, classList);

        if (type === elements.IMG)
            setImageAttributes(element, href, alt, options);
        else if (type === elements.A)
            setLinkAttributes(element, href, alt); // alt == displayText for links
        else if (textTypes.includes(type))
            setHeaderText(element, href, options); // href === text for headers and paragraphs

        return element;
    }

    /**
     * @param element {HTMLElement}
     * @param href {string}
     * @param alt {string}
     * @param options {{hideTitle: boolean}}
     */
    function setImageAttributes(element, href, alt, options) {
        if (href)
            element.setAttribute(ATTRS.SRC, href);

        if (alt) {
            element.setAttribute(ATTRS.ALT, alt);
            element.setAttribute(ATTRS.ARIA_ROLE, alt);

            if (!options || !options.hideTitle)
                element.setAttribute(ATTRS.TITLE, alt);
        }
    }

    /**
     *
     * @param element {HTMLElement}
     * @param href {string}
     * @param text {string}
     */
    function setLinkAttributes(element, href, text) {
        if (href)
            element.setAttribute(ATTRS.HREF, href);

        if (text)
            element.innerText = text;
    }

    /**
     *
     * @param element {HTMLElement}
     * @param text {string}
     * @param options {{html: boolean}}
     */
    function setHeaderText(element, text, options) {
        if (!text)
            return;

        if (options && options.html)
            element.innerHTML = text;
        else
            element.innerText = text;
    }

    win.INPUTS = INPUTS;
    win.EVENTS = EVENTS;
    win.ATTRS = ATTRS;
    win.elements = elements;
    win.ElementFactory = ElementFactory;
})(window);
