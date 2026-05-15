const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js");

const defaultSmartPricingEvents = () => {
  const year = new Date().getFullYear();

  return [
    {
      name: "Coastal holiday rush",
      startDate: new Date(`${year}-12-20`),
      endDate: new Date(`${year + 1}-01-03`),
      multiplier: 1.35,
    },
    {
      name: "Nairobi event week",
      startDate: new Date(`${year}-09-01`),
      endDate: new Date(`${year}-09-07`),
      multiplier: 1.25,
    },
  ];
};

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: String,
    url:String,
  },
  price: Number,
  location: String,
  county: String,
  country: String,
  roomType: {
    type: String,
    default: "Private room",
  },
  maxGuests: {
    type: Number,
    default: 2,
  },
  amenities: [String],
  pricing: {
    cleaningFee: {
      type: Number,
      default: 0,
    },
    serviceFeePercent: {
      type: Number,
      default: 10,
    },
    minStay: {
      type: Number,
      default: 1,
    },
    occupancyTarget: {
      type: Number,
      default: 70,
    },
    smartPricingEnabled: {
      type: Boolean,
      default: true,
    },
    weekendMultiplier: {
      type: Number,
      default: 1.15,
    },
    peakSeasonStart: Date,
    peakSeasonEnd: Date,
    peakSeasonMultiplier: {
      type: Number,
      default: 1.25,
    },
    offPeakStart: Date,
    offPeakEnd: Date,
    offPeakMultiplier: {
      type: Number,
      default: 0.9,
    },
    events: {
      type: [
        {
          name: String,
          startDate: Date,
          endDate: Date,
          multiplier: {
            type: Number,
            default: 1.2,
          },
        },
      ],
      default: defaultSmartPricingEvents,
    },
  },
  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    },
  ],

  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },

});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
     await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
