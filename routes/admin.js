const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isAdmin } = require("../middleware");
const adminController = require("../controllers/admin");

router.use(isLoggedIn, isAdmin);

router.get("/", wrapAsync(adminController.renderDashboard));
router.get("/properties", wrapAsync(adminController.renderProperties));
router.get("/bookings", wrapAsync(adminController.renderBookings));
router.get("/users", wrapAsync(adminController.renderUsers));

module.exports = router;
