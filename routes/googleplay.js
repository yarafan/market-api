const router = require("express").Router();
const qs = require("querystring");
const gPlay = require("../lib/google-play-api.js");

router.route("/")
    .get((req, res) => {
        res.set("Content-Type", "application/json");
        res.send(JSON.stringify({
            endpoints: [
                {
                    endpoint: "positions",
                    args: {
                        country: "Specify country (required)",
                        term: "Search term (required)",
                        total: "Amount of apps (optional, divisible by 20)",
                    }
                },
                {
                    endpoint: "reviews"
                }
            ]
        }));
    })
    .post((req, res) => {
        res.set("Content-Type", "application/json");
        res.send(JSON.stringify({
            endpoints: [
                {
                    endpoint: "positions",
                    args: {
                        country: "Specify country (required)",
                        term: "Search term (required)",
                        total: "Amount of apps (optional, divisible by 20)",
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

        gPlay.positions({ country: query.country, term: query.term, total: query.total || 1, })
            .then((results) => {
                res.set("Content-Type", "application/json");
                res.send(JSON.stringify({results: results}));
            })
            .catch((err) => res.send(err.message));
    })
    .post((req, res) => {
        const query = req.body;

        gPlay.positions({ country: query.country, term: query.term, total: query.total || 1, })
            .then((results) => {
                res.set("Content-Type", "application/json");
                res.send(JSON.stringify({results: results}));
            })
            .catch((err) => res.send(err.message));
    });

module.exports = router;
