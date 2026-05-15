require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");

const initData = require("./data.js");
const Booking = require("./models/booking.js");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const MONGO_URL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust";
const MONGO_TIMEOUT = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || (hasDatabaseName(MONGO_URL) ? undefined : "wanderlust");
const SEED_USERNAME = process.env.SEED_USERNAME || "seed-owner";
const SEED_EMAIL = process.env.SEED_EMAIL || "seed-owner@example.com";
const SEED_PASSWORD = process.env.SEED_PASSWORD || "seedpassword";

const currentYear = new Date().getFullYear();
const defaultSmartPricing = {
  smartPricingEnabled: true,
  weekendMultiplier: 1.15,
  peakSeasonStart: `${currentYear}-12-15`,
  peakSeasonEnd: `${currentYear + 1}-01-05`,
  peakSeasonMultiplier: 1.25,
  offPeakStart: `${currentYear}-05-01`,
  offPeakEnd: `${currentYear}-06-15`,
  offPeakMultiplier: 0.9,
  events: [
    {
      name: "Coastal holiday rush",
      startDate: `${currentYear}-12-20`,
      endDate: `${currentYear + 1}-01-03`,
      multiplier: 1.35,
    },
    {
      name: "Nairobi event week",
      startDate: `${currentYear}-09-01`,
      endDate: `${currentYear}-09-07`,
      multiplier: 1.25,
    },
  ],
};

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: MONGO_TIMEOUT,
      ...(MONGO_DB_NAME ? { dbName: MONGO_DB_NAME } : {}),
    });
    console.log("Connected to MongoDB");

    await initDB();
    await mongoose.connection.close();
  } catch (err) {
    console.error("Database Error:", err);
    process.exitCode = 1;
  }
}

function hasDatabaseName(uri) {
  try {
    const parsedUri = new URL(uri);
    return Boolean(parsedUri.pathname && parsedUri.pathname !== "/");
  } catch (err) {
    return false;
  }
}

const initDB = async () => {
  try {
    const seedOwner = await getSeedOwner();
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Listing.deleteMany({});

    const updatedData = initData.data.map((obj) => ({
      ...obj,
      pricing: {
        ...defaultSmartPricing,
        ...(obj.pricing || {}),
        events: obj.pricing?.events || defaultSmartPricing.events,
      },
      owner: seedOwner._id,
    }));

    await Listing.insertMany(updatedData);
    console.log(`Database initialized with ${updatedData.length} listings`);
  } catch (err) {
    console.error("Init Error:", err);
    throw err;
  }
};

async function getSeedOwner() {
  let seedOwner = await User.findOne({ username: SEED_USERNAME });

  if (!seedOwner) {
    seedOwner = await User.register(
      new User({
        username: SEED_USERNAME,
        email: SEED_EMAIL,
        isAdmin: true,
      }),
      SEED_PASSWORD
    );
    console.log(`Created seed owner: ${SEED_USERNAME}`);
    return seedOwner;
  }

  let updated = false;
  if (seedOwner.email !== SEED_EMAIL) {
    seedOwner.email = SEED_EMAIL;
    updated = true;
  }
  if (!seedOwner.isAdmin) {
    seedOwner.isAdmin = true;
    updated = true;
  }
  if (updated) {
    await seedOwner.save();
    console.log(`Updated seed owner admin access: ${SEED_USERNAME}`);
  }

  return seedOwner;
}

connectDB();
