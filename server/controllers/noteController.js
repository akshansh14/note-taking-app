const Note = require("../models/Notes");
const { cloudinary } = require("../config/cloudinaryConfig");

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notes", error: error.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const { title, content, transcript } = req.body;
    const userId = req.userId;

    const images = req.files["images"]
      ? req.files["images"].map((file) => file.path)
      : [];
    const audio = req.files["audio"] ? req.files["audio"][0].path : null;

    const note = new Note({
      title,
      content,
      transcript, // ✅ Store transcript in DB
      user: userId,
      images,
      audio,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res
      .status(500)
      .json({ message: "Error creating note", error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isFavorite, transcript } = req.body;
    const newImages = req.files["newImages"]
      ? req.files["newImages"].map((file) => file.path)
      : [];
    const existingImages = JSON.parse(req.body.existingImages);
    const updatedImages = existingImages.concat(newImages);
    const note = await Note.findOneAndUpdate(
      { _id: id, user: req.userId },
      { title, content, isFavorite, transcript, images: updatedImages },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json(note);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating note", error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the note
    const note = await Note.findOneAndDelete({ _id: id, user: req.userId });
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Delete images from Cloudinary
    if (note.images && note.images.length > 0) {
      const imageDeletionPromises = note.images.map((imageUrl) => {
        const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
        return cloudinary.uploader.destroy(`notes/images/${publicId}`);
      });
      await Promise.all(imageDeletionPromises);
    }

    // Delete audio from Cloudinary
    if (note.audio) {
      const audioPublicId = note.audio.split("/").pop().split(".")[0]; // Extract public ID
      await cloudinary.uploader.destroy(`notes/audio/${audioPublicId}`, {
        resource_type: "video",
      });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res
      .status(500)
      .json({ message: "Error deleting note", error: error.message });
  }
};
