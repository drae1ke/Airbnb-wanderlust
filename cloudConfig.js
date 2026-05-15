const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

const missingCloudinaryEnv = ["CLOUD_NAME", "CLOUD_API_KEY", "CLOUD_API_SECRET"].filter(
    (key) => !process.env[key]
);

if (missingCloudinaryEnv.length) {
    throw new Error(`Missing Cloudinary environment variables: ${missingCloudinaryEnv.join(", ")}`);
}

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "wanderlust_DEV",
    allowedFormats: ["png", "jpg", "jpeg"],
});

module.exports = {
    cloudinary: cloudinary.v2,
    storage,
};
