const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const sharp = require("sharp");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Unified storage for both images & audio
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "notes"; // Default folder
    let resourceType = "image"; // Default type

    if (file.mimetype.startsWith("audio/")) {
      folder = "notes/audio";
      resourceType = "video"; // Cloudinary treats audio as "video"
    } else if (file.mimetype.startsWith("image/")) {
      folder = "notes/images";
    }

    return {
      folder: folder,
      allowed_formats: ["jpg", "png", "jpeg", "mp3", "wav","webm","webp"],
      resource_type: resourceType,
    };
  },
});

// ✅ Create a single multer upload instance
const upload = multer({ storage });

module.exports = { cloudinary, upload };
