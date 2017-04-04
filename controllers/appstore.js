"use strict";

const router = require("express").Router();
const qs = require("querystring");
const AppStore = require("../lib/appstore-api.js");

const newTorCircuit = () => {
    const config = require("../config.js");
    const TorControl = require("tor-control");

    var control = new TorControl({
        host: config.tor.host,
        port: config.tor.controlPort,
        password: config.tor.password
    });
    control.signalNewnym(() => {});
};

const errorResponse = (res) => (err) => {
    newTorCircuit();
    res.send(err.message);
};

const jsonResponse = (res) => (json) => {
    res.set("Content-Type", "application/json");
    res.send(JSON.stringify({results: json}));
};

router.get("/positions", (req, res) => {
    const query = qs.parse(req.url.split("?")[1]);
    const options = {
        country: query.country,
        term: query.term,
    };

    AppStore.positions(options).then(jsonResponse(res)).catch(errorResponse(res));
});

router.get("/appinfo", (req, res) => {
    const query = qs.parse(req.url.split("?")[1]);
    const options = {
        appId: query.appid,
        country: query.country
    }

    AppStore.appInfo(options).then(jsonResponse(res)).catch(errorResponse(res));
});

module.exports = router;
