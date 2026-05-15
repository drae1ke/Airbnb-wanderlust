const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.renderDashboard = async (req, res) => {
  const [
    propertyCount,
    bookingCount,
    userCount,
    adminCount,
    recentProperties,
    recentBookings,
  ] = await Promise.all([
    Listing.countDocuments({}),
    Booking.countDocuments({}),
    User.countDocuments({}),
    User.countDocuments({ isAdmin: true }),
    Listing.find({}).populate("owner").sort({ _id: -1 }).limit(5),
    Booking.find({})
      .populate("listing guest host")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.render("admin/dashboard.ejs", {
    stats: {
      propertyCount,
      bookingCount,
      userCount,
      adminCount,
    },
    recentProperties,
    recentBookings,
  });
};

module.exports.renderProperties = async (req, res) => {
  const listings = await Listing.find({}).populate("owner").sort({ _id: -1 });
  res.render("admin/properties.ejs", { listings });
};

module.exports.renderBookings = async (req, res) => {
  const bookings = await Booking.find({})
    .populate("listing guest host")
    .sort({ createdAt: -1 });

  res.render("admin/bookings.ejs", { bookings });
};

module.exports.renderUsers = async (req, res) => {
  const users = await User.find({}).sort({ isAdmin: -1, username: 1 });
  res.render("admin/users.ejs", { users });
};
