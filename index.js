const options = {
    host: process.argv[3] || "localhost",
    port: process.argv[2] || 8080
}

require("./app.js").run(options);
