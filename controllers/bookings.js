const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { calculateBookingPrice } = require("../utils/pricing");

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body.booking;
  const listing = await Listing.findById(id).populate("owner");

  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  if (listing.owner && listing.owner._id.equals(req.user._id)) {
    req.flash("error", "Owners cannot book their own room");
    return res.redirect(`/listings/${id}`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    throw new ExpressError(400, "Check-in date cannot be in the past");
  }

  const pricingSummary = calculateBookingPrice(listing, checkInDate, checkOutDate);
  const { nights } = pricingSummary;
  const minStay = listing.pricing?.minStay || 1;

  if (nights < minStay) {
    throw new ExpressError(400, `Minimum stay is ${minStay} night${minStay === 1 ? "" : "s"}`);
  }

  if (Number(guests) > listing.maxGuests) {
    throw new ExpressError(400, `This room hosts up to ${listing.maxGuests} guest${listing.maxGuests === 1 ? "" : "s"}`);
  }

  await Booking.create({
    listing: listing._id,
    guest: req.user._id,
    host: listing.owner._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests,
    nights,
    nightlyRate: pricingSummary.averageNightlyRate,
    staySubtotal: pricingSummary.staySubtotal,
    cleaningFee: pricingSummary.cleaningFee,
    serviceFee: pricingSummary.serviceFee,
    totalPrice: pricingSummary.totalPrice,
    smartPricingApplied: pricingSummary.smartPricingApplied,
    priceBreakdown: pricingSummary.priceBreakdown,
  });

  req.flash("success", "Booking confirmed");
  res.redirect(`/listings/${id}`);
};
