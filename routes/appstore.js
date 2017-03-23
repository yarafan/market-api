"use strict";

const router = require("express").Router();
const qs = require("querystring");
const AppStore = require("../lib/app-store-api.js");

router.route("/")
    .get((req, res) => {
        res.set("Content-Type", "application/json");
        res.send(JSON.stringify({
            endpoints: [
                {
                    endpoint: "positions",
                    args: {
                        country: "Specify country (default RU)",
                        term: "Search term (required)",
                    }
                },
            ]
        }));
    });
router.route("/positions")
    .get((req, res) => {
        const query = qs.parse(req.url.split("?")[1]);

        AppStore.positions({
            country: query.country,
            term: query.term,
        })
            .then((results) => {
                res.set("Content-Type", "application/json");
                res.send(JSON.stringify({results: results}));
            })
            .catch((err) => res.send(err.message));
    });
module.exports = router;
