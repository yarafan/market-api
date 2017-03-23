"use strict";

const Promise = require("bluebird");
const AppStoreFront = require("./appstore/app-store-front.js");
const request = Promise.promisifyAll(
    require("request").defaults({
        baseUrl: "https://search.itunes.apple.com/",
        headers: {
            "User-Agent": "iTunes/12.5.4 AppleWebKit/7602.3012.0.11"
        }
    }),
    {
        multiArgs: true
    }
);
const Cheerio= require("cheerio");
const _ = require("lodash");

const market = {
    positions: (options) => {
        return new Promise((resolve, reject) => {
            const storeFront = AppStoreFront[options.country] || AppStoreFront.ru;
            const term = options.term;

            if(!term) {
                reject(new Error("Please provide search term"));
            }

            var _opts = {
                uri: "/WebObjects/MZStore.woa/wa/search",
                headers: {
                    "X-Apple-Store-Front": storeFront,
                },
                qs: {
                    term: term
                },
            };
            request.getAsync(_opts)
                .spread((res, body) => {
                    const $ = Cheerio.load(body);
                    var data = $("script").filter((i, el) => el.children[0] !== undefined).map((i, el) => el.children[0]);
                    var info = data[1].data;
                    const matches = info.match(/"searchPageData":(.+),"defaultArtistArtwork"/);
                    const json = JSON.parse(`${matches[1]}}`);
                    const apps = _.filter(json.bubbles, (el) => el.name == "software")[0].results;
                    const results = apps.map((el, i) => ({ id: el.id, position: i + 1 }));

                    resolve(results);
                })
                .catch((err) => reject(err));

        });
    },
};

module.exports = {
    positions: market.positions
};
