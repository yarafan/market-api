"use strict";

const qs = require("querystring");
const ProxyList = require("proxy-lists");
var _opts = {
    countries: [],
    protocols: ["http"],
    anonymityLevels: ["anonymous", "elite"],
    sourcesWhiteList: null,
    sourcesBlackList: ["bitproxies", "kingproxies"],
    series: false,
    ipTypes: ["ipv4"]
};

module.exports = (req, res, next) => {
    var query;
    var proxies = [];
    if (req.method === "GET") {
        query = qs.parse(req.url.split("?")[1]);
    } else {
        query = req.body;
    }

    const country = query.country;

    if (!country) {
        next("route");
    }
    _opts.countries.push(country);

    const gettingProxies = ProxyList.getProxies(_opts);

    gettingProxies.on("data", (data) => {
        proxies = proxies.concat(data);
    });

    gettingProxies.once("end", () => {
        req.__proxy__ = proxies[0];
        next();
    });
};
