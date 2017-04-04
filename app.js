"use strict";

const host = "localhost";
const port = 8080;
const app = require("express")();
const debug = require("debug")("market-api:initialization");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

debug("Mounting routes");
app.use(require("./middleware/proxy-request.js"));
app.use(require("./controllers"));
debug("Routes mounted");

app.listen(port, host, () => debug(`Server is listening on http://${host}:${port}`));
