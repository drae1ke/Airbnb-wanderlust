const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookings.js");

router.post("/callback", express.json(), bookingController.mpesaCallback);

module.exports = router;
