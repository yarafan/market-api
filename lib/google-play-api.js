const config = require("../config.js");
const qs = require("querystring");
const _ = require("lodash");
const Promise = require("promise");


const market = {
    _init: (country, language) => {
        return new Promise((resolve, reject) => {
            if (country) {
                const api = require("gpapi").GooglePlayAPI({
                    username: config.gPlay.username,
                    password: config.gPlay.password,
                    androidId: config.gPlay.androidId,
                    countryCode: country,
                    language: language || "ru_Ru",
                });
                resolve(api);
            } else {
                reject(new Error("Please specify country"));
            }
        });
    },

    positions: (options) => {
        const nextPageUrl = (response) => response.payload.searchResponse.doc[0].containerMetadata.nextPageUrl
        const marketIds = (response) => response.payload.searchResponse.doc[0].child.map(function(el) { return el.docid });

        const getPage = (api, url, offset) => {
            const path = url.split("?")[0];
            const query = qs.parse(url.split("?")[1]);

            return api.executeRequestApi(path, Object.assign(query, {o: offset}));
        };

        return new Promise((resolve, reject) => {
            market._init(options.country, options.language)
                .then((api) => {
                    const query =  {
                        c:3, n: 20, o: 0, q: options.term
                    };

                    api.executeRequestApi("search", query)
                        .then((response) => {
                            const results = marketIds(response);
                            const totalPages = options.total ? Math.ceil(options.total / 20) : 1;
                            const pages = [];
                            for (var i = 1; i < totalPages; ++i) {
                                offset = 20 * i;
                                pages.push(getPage(api, nextPageUrl(response), offset));
                            }
                            Promise.all(pages)
                                .then((responses) => {
                                    responses.forEach((response) => results.push(marketIds(response)));
                                    resolve(_.flatten(results).map((app, i) => ({app: app, position: i + 1})));
                                })
                                .catch((err) => console.log(err.message));
                        })
                        .catch((err) => reject(err));
                })
                .catch((err) => reject(err))
        });
    }
}
// Reviews
// api.executeRequestApi("rev", {c:3, n: 20, o: 0, doc: "com.viber.voip" } ).then(function(res) {
//     console.log(res.payload.reviewResponse.getResponse);
// });
module.exports = {
        positions: market.positions
};