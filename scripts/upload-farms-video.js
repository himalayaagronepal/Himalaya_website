// One-off: upload the /farms hero master video to Cloudinary.
// Run from the project root:  node scripts/upload-farms-video.js
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

const file = path.join(__dirname, "..", "media-source", "himalaya_agro_bg.mp4");

console.log("Uploading", file, "...");
cloudinary.uploader.upload_large(
  file,
  {
    resource_type: "video",
    public_id: "himalaya_agro_bg",
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
