"use strict";

const config = require("../config.js");
const qs = require("querystring");
const _ = require("lodash");
const Promise = require("bluebird");
const debug = require("debug")("market-api:gpapi");

const market = {
    _init: (options) => {
        const country = options.country || "ru";
        const language = options.language || "ru_RU";
        const proxy = options.proxy;

        return new Promise((resolve, reject) => {
            var opts = {
                username: config.gPlay.username,
                password: config.gPlay.password,
                androidId: config.gPlay.androidId,
                countryCode: country,
                language: language,
                requestsDefaultParams: {},
            };

            if (proxy) {
                opts.requestsDefaultParams = Object.assign(opts.requestsDefaultParams, {
                    proxy: proxy
                })
            }

            const api = require("gpapi").GooglePlayAPI(opts);

            debug(`Initialize gpapi with ${JSON.stringify(opts)}`);

            resolve(api);
        });
    },

    positions: (options) => {
        const nextPageUrl = (response) => response.payload.searchResponse.doc[0].containerMetadata.nextPageUrl;
        const marketIds = (response) => response.payload.searchResponse.doc[0].child.map((el) => el.docid );

        const getPage = (api, url, offset) => {
            const path = url.split("?")[0];
            const query = qs.parse(url.split("?")[1]);

            return api.executeRequestApi(path, Object.assign(query, {o: offset}));
        };

        return new Promise((resolve, reject) => {
            market._init(options)
                .then((api) => {
                    const term = options.term;
                    if(!term) {
                        reject(new Error("Please provide search term"));
                    }
                    const query =  {
                        c:3, n: 20, o: 0, q: term
                    };

                    debug("Execute positions request");

                    api.executeRequestApi("search", query)
                        .then((response) => {

                            debug("Processing positions");

                            var results = marketIds(response);
                            const totalPages = options.total ? Math.ceil(options.total / 20) : 1;
                            const pages = [];
                            for (var i = 1; i < totalPages; ++i) {
                                var offset = 20 * i;
                                pages.push(getPage(api, nextPageUrl(response), offset));
                            }
                            Promise.all(pages)
                                .then((responses) => {
                                    responses.forEach((response) => results.push(marketIds(response)));
                                    results = _.flatten(results).map((id, i) => ({ id: id, position: i + 1}));

                                    debug(results);
                                    debug("Positions processed");

                                    resolve(results);
                                })
                                .catch((err) => reject(err));
                        })
                        .catch((err) => reject(err));
                })
                .catch((err) => reject(err));
        });
    },

    appInfo: (options) => {
        const appId = options.appId;

        return new Promise((resolve, reject) => {
            if(!appId) {
                reject(new Error("Please provide app store id"));
            }

            market._init(options)
                .then((api) => {

                    debug(`Start processing of *${appId}*`);

                    api.details(appId)
                        .then((app) => {
                            const appDetails = app.details.appDetails;
                            const info = {
                                title: app.title,
                                category: appDetails.appCategory[0],
                                description: app.descriptionHtml,
                                rates: {
                                    stars: app.aggregateRating.starRating,
                                    ratingsCount: app.aggregateRating.ratingsCount.low
                                },
                                recentChanges: appDetails.recentChangesHtml,
                                updated: appDetails.uploadDate,
                                size: appDetails.installationSize.low,
                                currentVersion: appDetails.versionString,
                                developer: {
                                    name: appDetails.developerName,
                                    email: appDetails.developerEmail,
                                    site: appDetails.developerWebsite,
                                }
                            };

                            debug(info);
                            debug(`*${appId}* processed`);

                            resolve({ app: info });
                        })
                        .catch(err => reject(err));
                });
        });
    },
};

module.exports = {
    positions: market.positions,
    appInfo: market.appInfo
};
