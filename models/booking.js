const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  guest:   { type: Schema.Types.ObjectId, ref: "User",    required: true },
  host:    { type: Schema.Types.ObjectId, ref: "User",    required: true },
  checkIn:  { type: Date,   required: true },
  checkOut: { type: Date,   required: true },
  guests:   { type: Number, required: true, min: 1 },
  nights:   { type: Number, required: true, min: 1 },
  nightlyRate:   { type: Number, required: true },
  staySubtotal:  { type: Number, required: true },
  cleaningFee:   { type: Number, default: 0 },
  serviceFee:    { type: Number, default: 0 },
  totalPrice:    { type: Number, required: true },
  smartPricingApplied: { type: Boolean, default: false },
  priceBreakdown: [{ date: Date, rate: Number, multiplier: Number, label: String }],
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "failed"],
    default: "pending",
  },
  // M-Pesa fields
  mpesaCheckoutRequestId: { type: String, default: null },
  mpesaReceiptNumber:     { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", bookingSchema);