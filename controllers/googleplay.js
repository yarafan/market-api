"use strict";

const router = require("express").Router();
const qs = require("querystring");
const gPlay = require("../lib/googleplay-api.js");

const errorResponse = (res) => (err) => res.send(err.message);

const jsonResponse = (res) => (json) => {
    res.set("Content-Type", "application/json");
    res.send(JSON.stringify({results: json}));
};

router.get("/positions", (req, res) => {
    const query = qs.parse(req.url.split("?")[1]);
    const options = {
        country: query.country,
        term: query.term,
        total: query.total || 100,
        proxy: req.proxy
    }

    gPlay.positions(options).then(jsonResponse(res)).catch(errorResponse(res));
});

router.get("/appinfo", (req, res) => {
    const query = qs.parse(req.url.split("?")[1]);
    const options = {
        appId: query.appid,
        language: query.language,
    };

    gPlay.appInfo(options).then(jsonResponse(res)).catch(errorResponse(res));
});

module.exports = router;
