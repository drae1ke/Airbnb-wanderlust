 const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    county: Joi.string().required(),
    roomType: Joi.string().required(),
    maxGuests: Joi.number().integer().required().min(1).max(20),
    amenities: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).optional(),
    pricing: Joi.object({
      cleaningFee: Joi.number().min(0).default(0),
      serviceFeePercent: Joi.number().min(0).max(30).default(10),
      minStay: Joi.number().integer().min(1).max(30).default(1),
      occupancyTarget: Joi.number().min(0).max(100).default(70),
      smartPricingEnabled: Joi.boolean().truthy("true").truthy("on").falsy("false").optional(),
      weekendMultiplier: Joi.number().min(0.5).max(5).default(1.15),
      peakSeasonStart: Joi.date().iso().allow("", null),
      peakSeasonEnd: Joi.date().iso().allow("", null),
      peakSeasonMultiplier: Joi.number().min(0.5).max(5).default(1.25),
      offPeakStart: Joi.date().iso().allow("", null),
      offPeakEnd: Joi.date().iso().allow("", null),
      offPeakMultiplier: Joi.number().min(0.5).max(5).default(0.9),
      events: Joi.array().items(
        Joi.object({
          name: Joi.string().allow("", null),
          startDate: Joi.date().iso().allow("", null),
          endDate: Joi.date().iso().allow("", null),
          multiplier: Joi.number().min(0.5).max(5).allow("", null),
        })
      ).optional(),
    }).optional(),
    price: Joi.number().required().min(0),
    image: Joi.object({
      url: Joi.string().uri().allow("", null),
      filename: Joi.string().allow("", null),
    }).optional()
  }).required()
});
module.exports.reviewSchema= Joi.object({
    review: Joi.object({
    rating:Joi.number().required().min(1).max(5),
    comment:Joi.string().required(),
  }).required()
});

module.exports.bookingSchema = Joi.object({
  booking: Joi.object({
    checkIn: Joi.date().iso().required(),
    checkOut: Joi.date().iso().greater(Joi.ref("checkIn")).required(),
    guests: Joi.number().integer().required().min(1).max(20),
    phone: Joi.string().required().pattern(/^(07|2547|\+2547)\d{8}$/),
  }).required(),
});
