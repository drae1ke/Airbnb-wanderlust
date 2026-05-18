const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

router.get("/:bookingId/pending", isLoggedIn, wrapAsync(bookingController.showPendingBooking));
router.get("/:bookingId/status", isLoggedIn, wrapAsync(bookingController.getBookingStatus));

module.exports = router;
