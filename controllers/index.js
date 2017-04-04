"use strict";

const router = require("express").Router();

router.use("/appstore", require("./appstore.js"));
router.use("/googleplay", require("./googleplay.js"));

module.exports = router
