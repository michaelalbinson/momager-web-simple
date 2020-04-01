/**
 * Create an XMLHTTPRequest for the specified URL with the specified request body
 *
 * @param url {string}
 * @param body {object}
 * @param successCallback {function}
 * @param failureCallback {function}
 * @param method {string=}
 */
function request(url, body, successCallback, failureCallback, method) {
    method = method ? method : request.METHODS.POST;

    const req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let json = req.responseText;
                try {
                    json = JSON.parse(req.responseText);
                } catch (e) {}

                successCallback(json);
            } else
                failureCallback(req.responseText, this.status);
        }
    };

    req.open(method, url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(body));
}

request.METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE'
};
