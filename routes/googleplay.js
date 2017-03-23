"use strict";

const router = require("express").Router();
const qs = require("querystring");
const gPlay = require("../lib/google-play-api.js");

// const proxyList = require("../middleware/routes/googleplay/proxy-list.js");

// Route specific middleware
// router.use("/positions", proxyList)

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
                        total: "Amount of apps (optional, divisible by 20, default 100)",
                    }
                },
                {
                    endpoint: "reviews"
                }
            ]
        }));
    });
router.route("/positions")
    .get((req, res) => {
        const query = qs.parse(req.url.split("?")[1]);

        gPlay.positions({
            country: query.country || "ru",
            term: query.term,
            total: query.total || 100,
            // proxy: `http://${req.__proxy__.ipAddress}:${req.__proxy__.port}`
        }).then((results) => {
            res.set("Content-Type", "application/json");
            res.send(JSON.stringify({results: results}));
        }).catch((err) => res.send(err.message));
    });

module.exports = router;
