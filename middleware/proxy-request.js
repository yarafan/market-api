const debug = require("debug")("market-api:proxy");
const Promise = require("bluebird");
const request = Promise.promisifyAll(require("request"), { multiArgs: true });
const qs = require("querystring");

module.exports = (req, res, next) => {
    const query = qs.parse(req.url.split("?")[1]);
    const country = query.country || "ru";
    const q = qs.stringify({
        country: country,
        supportsHttps: true,
    });
    request.getAsync({
        uri: "http://gimmeproxy.com/api/getProxy",
        qs: qs
    })
        .spread((res, body) => {
            debug(proxy);
            const proxy = JSON.parse(body);
            req.proxy = `${proxy.type}://${proxy.ipPort}`;
            next();
        })
        .catch((err) => console.log(err));
};
