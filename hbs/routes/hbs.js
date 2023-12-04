const express = require("express");
const router = express.Router();
const ctrlTrips = require("../controllers/trips");
const ctrlOther = require("../controllers/other");
const ctrlDB = require("../controllers/db");

router.get("/", ctrlOther.home);
router.get("/trips", ctrlTrips.trips);
router.get("/trip-details", ctrlTrips.tripDetails);
router.get("/profile", ctrlOther.profile);
router.get("/register", ctrlOther.register);
router.get("/db", ctrlDB.pageDB);
module.exports = router;
