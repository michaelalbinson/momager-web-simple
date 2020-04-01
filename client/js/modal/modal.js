'use strict';


class BGFModal extends _BaseDOM {
    constructor(title, body) {
        super();

        this.bootstrapStyles();
        this.styles.push('/css/modal.css');
        this.createStyles();

        this.title = title;
        this.body = body;

        this.openHandlers = [];
        this.closeHandlers = [];

        this.buttons = [];

        this.getFrame();
    }

    getFrame() {
        const div = ElementFactory(elements.DIV, 'modal-background');
        div.setAttribute(ATTRS.ROLE, 'dialog');
        div.setAttribute(ATTRS.TABINDEX, '-1');

        const modalFrame = ElementFactory(elements.DIV, 'modal-frame');
        modalFrame.setAttribute(ATTRS.ROLE, 'document');

        const content = ElementFactory(elements.DIV, 'modal-content');
        // let scripts dynamically change what they'd like to in the modal content
        this.modalFrame = content;

        modalFrame.appendChild(content);
        div.appendChild(modalFrame);
        this.root.appendChild(div);
    }

    getHeader(title) {
        const modalHeader = ElementFactory(elements.DIV, 'modal-header');
        const headerText = ElementFactory(elements.H2, '', title);
        const closeButton = ElementFactory(elements.BUTTON, 'btn btn-default close');
        closeButton.setAttribute(ATTRS.ARIA_LABEL, 'Close');

        const ariaText = ElementFactory(elements.SPAN, '', '&times;', null, {html: true});
        ariaText.setAttribute(ATTRS.ARIA_HIDDEN, 'true');

        closeButton.appendChild(ariaText);
        closeButton.addEventListener(EVENTS.CLICK, this.close.bind(this));

        modalHeader.appendChild(headerText);
        modalHeader.appendChild(closeButton);
        this.modalFrame.appendChild(modalHeader);
    }

    getBody(body) {
        const modalBody = ElementFactory(elements.DIV, 'modal-body');
        modalBody.appendChild(new ElementFactory(elements.P, '', body));
        this.modalFrame.appendChild(modalBody);
    }

    getFooter() {
        const modalFooter = ElementFactory(elements.DIV, 'modal-footer');
        const includeCloseButton = this.getFooterButtons(modalFooter);
        this.getAddedButtons(modalFooter);
        if (includeCloseButton) {
            const button = ElementFactory(elements.BUTTON, 'btn btn-primary', 'Close');
            button.addEventListener(EVENTS.CLICK, this.close.bind(this));
            modalFooter.appendChild(button);
        }

        this.modalFrame.appendChild(modalFooter);
    }

    focusTrap() {
        const KEY_CODE_TAB = 9;
        const focusableElements = this.root.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        this.root.querySelector(elements.BUTTON).focus();

        this.root.addEventListener(EVENTS.KEY_DOWN, (e) => {
            console.log('keydown!', e.target);
            const isTabPressed = (e.key === 'Tab' || e.keyCode === KEY_CODE_TAB);
            if (!isTabPressed)
                return;

            /* shift + tab */
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else /* tab */ {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    }

    getFooterButtons(parent) {
        return true;
    }

    getAddedButtons(parent) {
        this.buttons.forEach(button => {
            const html = button.type === 'link' ?
                new ElementFactory(elements.A, 'btn btn-primary', button.href, button.label) :
                new ElementFactory(elements.BUTTON, 'btn btn-primary', button.label);

            parent.appendChild(html);
        });
    }

    /**
     * Add a function to call when the modal is opened
     * @param fn {function}
     */
    addOpenListener(fn) {
        this.openHandlers.push(fn);
    }

    /**
     * Add a function to call when the modal is closed
     * @param fn {function}
     */
    addCloseListener(fn) {
        this.closeHandlers.push(fn);
    }

    addActionListener(event, fn) {

    }

    /**
     *
     * @param buttonObj {{label: string, type: string=, href: string=, callback: string=}}
     */
    addButton(buttonObj) {
        this.buttons.push(buttonObj);
    }

    /**
     * Open the modal and call attached open listeners
     */
    open() {
        this.getHeader(this.title);
        this.getBody(this.body);
        this.getFooter();

        // only one modal can be open at a time!
        if (BGFModal.currentModal)
            BGFModal.currentModal.close();

        this.openHandlers.forEach(fn => fn(this));

        document.body.style.overflow = 'hidden';
        document.body.appendChild(this);
        this.focusTrap();
        BGFModal.currentModal = this;
    }

    /**
     * Close the modal and call attached close handlers
     */
    close() {
        this.closeHandlers.forEach(fn => fn(this));

        this.remove();
        document.body.style.overflow = 'scroll';
        BGFModal.currentModal = null;
    }
}

BGFModal.currentModal =

customElements.define('bgf-modal', BGFModal);
