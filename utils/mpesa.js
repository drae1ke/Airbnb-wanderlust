const axios = require("axios");

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL;
const MPESA_ENV = (process.env.MPESA_ENV || "sandbox").toLowerCase();

const SANDBOX_BASE = "https://sandbox.safaricom.co.ke";
const PROD_BASE = "https://api.safaricom.co.ke";
const BASE_URL = MPESA_ENV === "production" ? PROD_BASE : SANDBOX_BASE;

if (!["sandbox", "production"].includes(MPESA_ENV)) {
  throw new Error('MPESA_ENV must be either "sandbox" or "production"');
}

const missingMpesaEnv = [
  "MPESA_CONSUMER_KEY",
  "MPESA_CONSUMER_SECRET",
  "MPESA_SHORTCODE",
  "MPESA_PASSKEY",
  "MPESA_CALLBACK_URL",
].filter((key) => !process.env[key]);

if (missingMpesaEnv.length) {
  throw new Error(`Missing M-Pesa environment variables: ${missingMpesaEnv.join(", ")}`);
}

async function getAccessToken() {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const { data } = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
  });
  return data.access_token;
}

function getTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
}

function getPassword(timestamp) {
  return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64");
}

/**
 * Initiate an STK Push.
 * @param {string} phone  - Customer phone number in international format, e.g. "254712345678"
 * @param {number} amount - Amount in KES (integer)
 * @param {string} bookingId - MongoDB booking _id (used as AccountReference)
 * @returns Daraja API response (contains CheckoutRequestID)
 */
async function initiateSTKPush(phone, amount, bookingId) {
  const token = await getAccessToken();
  const timestamp = getTimestamp();
  const password = getPassword(timestamp);

  const { data } = await axios.post(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: `WL-${bookingId}`,
      TransactionDesc: "Wanderlust room booking",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return data;
}

module.exports = { initiateSTKPush };
