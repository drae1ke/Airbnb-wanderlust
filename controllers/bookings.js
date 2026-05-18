const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { calculateBookingPrice } = require("../utils/pricing");
const { initiateSTKPush } = require("../utils/mpesa");

// Normalise a phone number to 2547XXXXXXXX format
function normalisePhone(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return "254" + digits.slice(1);
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("7") && digits.length === 9) return "254" + digits;
  throw new ExpressError(400, "Invalid phone number. Use format 07XXXXXXXX or 2547XXXXXXXX");
}

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests, phone } = req.body.booking;
  const listing = await Listing.findById(id).populate("owner");

  if (!listing) throw new ExpressError(404, "Listing not found");

  if (listing.owner && listing.owner._id.equals(req.user._id)) {
    req.flash("error", "Owners cannot book their own room");
    return res.redirect(`/listings/${id}`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkInDate < today) throw new ExpressError(400, "Check-in date cannot be in the past");

  const pricingSummary = calculateBookingPrice(listing, checkInDate, checkOutDate);
  const { nights } = pricingSummary;
  const minStay = listing.pricing?.minStay || 1;

  if (nights < minStay)
    throw new ExpressError(400, `Minimum stay is ${minStay} night${minStay === 1 ? "" : "s"}`);

  if (Number(guests) > listing.maxGuests)
    throw new ExpressError(
      400,
      `This room hosts up to ${listing.maxGuests} guest${listing.maxGuests === 1 ? "" : "s"}`
    );

  // 1. Create booking in pending state
  const booking = await Booking.create({
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
    status: "pending",
  });

  // 2. Fire STK Push
  try {
    const normalisedPhone = normalisePhone(phone);
    const stkResponse = await initiateSTKPush(
      normalisedPhone,
      pricingSummary.totalPrice,
      booking._id.toString()
    );

    // Persist the CheckoutRequestID so the callback can match this booking
    booking.mpesaCheckoutRequestId = stkResponse.CheckoutRequestID;
    await booking.save();
  } catch (mpesaErr) {
    // Don't throw — keep the pending booking but warn the guest
    console.error("STK Push failed:", mpesaErr.response?.data || mpesaErr.message);
    req.flash(
      "error",
      "Could not reach M-Pesa. Your booking is saved — please contact support to complete payment."
    );
    return res.redirect(`/bookings/${booking._id}/pending`);
  }

  req.flash("success", "Check your phone — an M-Pesa payment prompt has been sent.");
  res.redirect(`/bookings/${booking._id}/pending`);
};

// Show the "waiting for payment" page
module.exports.showPendingBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId).populate("listing");
  if (!booking) throw new ExpressError(404, "Booking not found");
  if (!booking.guest.equals(req.user._id)) throw new ExpressError(403, "Forbidden");
  res.render("bookings/pending.ejs", { booking });
};

// Polled by the client every few seconds
module.exports.getBookingStatus = async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId).select("status");
  if (!booking) return res.status(404).json({ error: "Not found" });
  res.json({ status: booking.status });
};

// M-Pesa callback — called by Safaricom servers after the guest pays (or cancels)
module.exports.mpesaCallback = async (req, res) => {
  // Always respond 200 immediately — Safaricom retries otherwise
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });

  try {
    const body = req.body?.Body?.stkCallback;
    if (!body) return;

    const { ResultCode, CheckoutRequestID } = body;
    const booking = await Booking.findOne({ mpesaCheckoutRequestId: CheckoutRequestID });
    if (!booking) return;

    if (ResultCode === 0) {
      // Payment successful — extract the receipt number
      const items = body.CallbackMetadata?.Item || [];
      const receiptItem = items.find((i) => i.Name === "MpesaReceiptNumber");
      booking.status = "confirmed";
      booking.mpesaReceiptNumber = receiptItem?.Value || null;
    } else {
      booking.status = "failed";
    }

    await booking.save();
  } catch (err) {
    console.error("M-Pesa callback error:", err);
  }
};