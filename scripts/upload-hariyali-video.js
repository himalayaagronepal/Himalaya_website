// One-off: upload the /farms hero "hariyali" master video to Cloudinary.
// Cloudinary then delivers an optimized, CDN-cached derivative (see
// app/components/farms/FarmsHeroVideo.tsx — f_auto,q_auto:good,c_limit,w_1920).
// Run from the project root:  node scripts/upload-hariyali-video.js
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
dotenv.config();

const cloudinary = require("cloudinary").v2;

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("Cloudinary env vars missing in .env.local");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

// Cloudinary's plan caps uploads at 100 MB, so we upload a high-quality,
// sub-100 MB H.264 derivative (not the ~274 MB raw master). Cloudinary then
// delivers an adaptive f_auto/q_auto:good copy from this — visible quality is
// set by that derivative, so there is no perceptible loss vs. the raw source.
const file = path.join(__dirname, "..", "media-source", "hariyali_farms_cloud.mp4");

console.log("Uploading", file, "...");
cloudinary.uploader.upload_large(
  file,
  {
    resource_type: "video",
    public_id: "hariyali_farms",
    overwrite: true,
    chunk_size: 6_000_000,
    invalidate: true,
  },
  (err, res) => {
    if (err) {
      console.error("UPLOAD ERROR:", err.message || err);
      process.exit(1);
    }
    console.log(
      JSON.stringify(
        {
          public_id: res.public_id,
          secure_url: res.secure_url,
          format: res.format,
          width: res.width,
          height: res.height,
          duration: res.duration,
          bytes: res.bytes,
        },
        null,
        2
      )
    );
  }
);
