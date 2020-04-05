'use strict';


class MomPage extends AppPage {
    render() {
        this.footer.render();
    }
}

customElements.define('mom-page', MomPage);
