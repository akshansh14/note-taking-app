const express = require("express");
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinaryConfig");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotes);

// ✅ Handle multiple fields correctly with upload.fields()
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 5 }, // Handle multiple images
    { name: "audio", maxCount: 1 }, // Handle single audio file
  ]),
  createNote
);
router.put(
  "/:id",
  upload.fields([{ name: "newImages", maxCount: 5 }]),
  updateNote
);
router.delete("/:id", deleteNote);

module.exports = router;
