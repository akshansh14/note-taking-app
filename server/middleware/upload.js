// /middlewares/upload.js

const multer = require('multer');
const path = require('path');

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.mimetype.startsWith('audio/') ? 'audio' : 'images'; // Determine the folder based on file type
    cb(null, path.join(__dirname, '../uploads', folder)); // Store images in 'uploads/images' and audio in 'uploads/audio'
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to avoid filename collisions
  }
});

// Create the multer instance with the storage configuration
const upload = multer({ storage: storage });

// Export a function that handles image and audio file uploads
module.exports = upload;
