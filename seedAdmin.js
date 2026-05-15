require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const User = require("./models/user.js");

const MONGO_URL = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust";
const MONGO_TIMEOUT = Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || (hasDatabaseName(MONGO_URL) ? undefined : "wanderlust");
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || process.env.SEED_USERNAME || "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SEED_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.SEED_PASSWORD || "adminpassword";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: MONGO_TIMEOUT,
      ...(MONGO_DB_NAME ? { dbName: MONGO_DB_NAME } : {}),
    });
    console.log("Connected to MongoDB");

    await upsertAdmin();
  } catch (err) {
    console.error("Database Error:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
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

async function upsertAdmin() {
  let adminUser = await User.findOne({
    $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }],
  });

  if (!adminUser) {
    adminUser = await User.register(
      new User({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        isAdmin: true,
      }),
      ADMIN_PASSWORD
    );
    console.log(`Created admin user: ${ADMIN_USERNAME}`);
    return;
  }

  adminUser.username = ADMIN_USERNAME;
  adminUser.email = ADMIN_EMAIL;
  adminUser.isAdmin = true;
  await adminUser.setPassword(ADMIN_PASSWORD);
  await adminUser.save();
  console.log(`Updated admin user: ${ADMIN_USERNAME}`);
}

connectDB();
