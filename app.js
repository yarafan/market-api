const run = (options) => {
    const host = options.host
    const port = options.port

    const app = require("express")();
    const bodyParser = require("body-parser");
    // routes
    const appstoreRoute = require("./routes/appstore.js")
    const googlePlayRoute = require("./routes/googleplay.js")
    // Global middleware
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    // mount points
    app.use("/appstore", appstoreRoute);
    app.use("/googleplay", googlePlayRoute);

    app.listen(port, host, () => console.log(`Server is listening on http://${host}:${port}`));
}

module.exports = {
    run: run
}
