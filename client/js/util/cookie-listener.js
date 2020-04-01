//
//  cookie-listener.js
//
//  Created by Michael Albinson on 2019-07-06.
//
//  Facilities for notifying users about the use of cookies on the site
//

'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const COOKIE_KEY = "AMP_U_GDPR_COOKIE";

    if (window.__test_only__)
        window.__test_only__.removeGDPRCookie = removeGDPRCookie;
    else
        window.__test_only__ = { removeGDPRCookie: removeGDPRCookie };

    if (getGDPRCookie())
        return;

    const GDPR_HTML =
        "<div class='head'>" +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
                "<span aria-hidden='true'>×</span>" +
            "</button>" +
        "</div>" +
        "<div class='body'>" +
            "Please know that cookies are required to operate and enhance our services. " +
            "By clicking the X button, the accept button, or continuing to use this site, you agree to our " +
            "<a href='/privacy/full'>Privacy Policy</a> and <a href='/terms'>Terms of Use</a>." +
        "</div>" +
        "<div class='foot'>" +
            "<button class='btn btn-light accept'>Accept</button>" +
        "</div>";

    const div = document.createElement('div');
    div.id = "GDPR_COOKIE_STATEMENT";
    div.classList.add('gdpr-privacy-statement');
    div.innerHTML = GDPR_HTML;
    document.body.appendChild(div);

    document.querySelector('.gdpr-privacy-statement button.accept')
        .addEventListener('click', setGDPRCookieAndClose);

    document.querySelector('.gdpr-privacy-statement button.close')
        .addEventListener('click', setGDPRCookieAndClose);

    function getGDPRCookie() {
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(COOKIE_KEY).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    }

    function setGDPRCookieAndClose() {
        const EXPIRES = "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
        document.cookie = encodeURIComponent(COOKIE_KEY) + "=" + encodeURIComponent('true') + EXPIRES;
        div.remove();
    }

    function removeGDPRCookie() {
        const EXPIRES = "; expires=Fri, 31 Dec 1999 23:59:59 GMT";
        document.cookie = encodeURIComponent(COOKIE_KEY) + "=" + encodeURIComponent('true') + EXPIRES;
    }
});
