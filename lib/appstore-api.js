"use strict";

const config = require("../config.js");
const Promise = require("bluebird");
const AppStoreFront = require("./appstore/app-store-front.js");
const Cheerio= require("cheerio");
const _ = require("lodash");
const debug = require("debug")("market-api:asapi");
var Agent = require('socks5-https-client/lib/Agent');

const _request_defaults = {
    headers: {
        "User-Agent": "iTunes/12.5.4 AppleWebKit/7602.3012.0.11"
    },
    agentClass: Agent,
    agentOptions: {
        socksHost: config.tor.host,
        socksPort: config.tor.port
    }
};
const request = Promise.promisifyAll(require("request").defaults(_request_defaults), { multiArgs: true });

const market = {
    positions: (options) => {
        return new Promise((resolve, reject) => {
            const storeFront = AppStoreFront[options.country] || AppStoreFront.ru;
            const term = options.term;

            if(!term) {
                reject(new Error("Please provide search term"));
            }

            var _opts = {
                uri: "https://search.itunes.apple.com/WebObjects/MZStore.woa/wa/search",
                headers: {
                    "X-Apple-Store-Front": storeFront,
                },
                qs: {
                    term: term
                },
            };

            debug("Execute positions request");

            request.getAsync(_opts)
                .spread((res, body) => {

                    debug("Processing positions");

                    const $ = Cheerio.load(body);
                    var data = $("script").filter((i, el) => el.children[0] !== undefined).map((i, el) => el.children[0]);
                    var info = data[1].data;
                    const matches = info.match(/"searchPageData":(.+),"defaultArtistArtwork"/);
                    const json = JSON.parse(`${matches[1]}}`);
                    const apps = _.filter(json.bubbles, (el) => el.name == "software")[0].results;
                    const results = apps.map((el, i) => ({ id: el.id, position: i + 1 }));

                    debug(results);
                    debug("Positions processed");

                    resolve(results);
                })
                .catch((err) => reject(err));

        });
    },

    appInfo: (options) => {
        return new Promise((resolve, reject) => {
            const appId = options.appId

            if(!appId) {
                reject(new Error("Please provide app store id"));
            }

            var _opts = {
                uri: "https://itunes.apple.com/lookup",
                qs: {
                    id: appId,
                    country: options.country || "ru",
                },
            };

            debug(`Start processing of *${appId}*`);

            request.getAsync(_opts)
                .spread((res, body) => {
                    const results = JSON.parse(body).results;
                    if (results.length) {
                        const app = results[0];
                        const info = {
                            title: app.trackName,
                            icon: app.artworkUrl100,
                            price: app.formattedPrice,
                            category: app.primaryGenreName,
                            description: app.description,
                            rates: {
                                stars: app.averageUserRating,
                                ratingsCount: app.userRatingCount
                            },
                            recentChanges: app.releaseNotes,
                            updated: app.currentVersionReleaseDate,
                            size: app.fileSizeBytes,
                            currentVersion: app.version,
                            contentRating: app.trackContentRating,
                            supportedLaguages: app.languageCodesISO2A,
                            supportedDevices: app.supportedDevices,
                            developer: {
                                name: app.artistName,
                            }
                        };

                        debug(info);
                        debug(`*${appId}* processed`);

                        resolve({ app: info });
                    } else {
                        reject(new Error("This app is not availiable in your country"));
                    }
                })
                .catch((err) => reject(err))
        });
    },
};

module.exports = {
    positions: market.positions,
    appInfo: market.appInfo
};
