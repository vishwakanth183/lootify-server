pe = require('parse-error');
ReE = async function (res, err, code) { // Error Web Response
    if (typeof code !== 'undefined') res.statusCode = code;
    return res.json({ success: false, error: err });
}
ReS = function (res, data, code) { // Success Web Response
    let send_data = { success: true };
    if (typeof data == 'object') {
        send_data = Object.assign(data, send_data);
    }
    if (typeof code !== 'undefined') res.statusCode = code;
    return res.json(send_data)
};

to = function (promise) {
    return promise
        .then(data => {
            return [null, data];
        }).catch(err =>
            [pe(err)]
        );
}