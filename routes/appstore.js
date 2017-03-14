const router = require("express").Router();

router.route("/")
    .get((req, res) => {
        res.send("From get Appstore")
    })
    .post((req, res) => {
        res.send("From post Appstore")
    })

module.exports = router
