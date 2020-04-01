"use strict";

function MCError(reason, status, err) {
    let _status, _reason;
    let _err = err;
    let _date = new Date().toString();

    this.setStatus = function(st) {
        if (typeof st !== "string" ||
            (st.toUpperCase() !== "UNKNOWN" && st.toUpperCase() !== "INT" && st.toUpperCase() !== "EXT"))
            return _status = "UNKNOWN";

        _status = st.toUpperCase();
    };

    this.setStatus(status);

    this.setReason = function(rs) {
        if (typeof rs !== "string")
            return _reason = "UNKNOWN";

        _reason = rs;
    };

    this.setReason(reason);

    this.toString = function() {
        return `{` +
                    `'status': '${_status}',` +
                    `'reason': '${_reason}',` +
                    `'date': '${_date}',` +
                    `'err': ${_err}` +
                `}`;
    };

    this.valueOf = function() {
        return this.toString();
    };

    this.getJSON = function() {
        return {
        'status': _status,
        'reason': _reason,
        'date': _date,
        'err': _err
        };
    };
}

module.exports = MCError;
