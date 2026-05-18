const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/bookings.js");

// GET  /bookings/:bookingId/pending  — "waiting for payment" page
router.get("/:bookingId/pending", isLoggedIn, wrapAsync(bookingController.showPendingBooking));

// GET  /bookings/:bookingId/status   — JSON poll endpoint
router.get("/:bookingId/status", isLoggedIn, wrapAsync(bookingController.getBookingStatus));

// POST /mpesa/callback               — Safaricom server-to-server callback
router.post("/mpesa/callback", express.json(), bookingController.mpesaCallback);

module.exports = router;