const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/audd", (req, res, next) => {
  res.render("audD/audd");
});

module.exports = router;