import React, { useRef, useState } from "react";
import { updateNote } from "../../services/api";
import {
  Trash,
  Heart,
  Maximize2,
  Minimize2,
  PencilIcon,
  PlusIcon,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const NoteModal = ({ isModalOpen, setIsModalOpen, note, onUpdate }) => {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [transcript, setTranscript] = useState(note.transcript);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(note.isFavorite);
  const [existingImages, setexistingImages] = useState(note.images || []);
  const [newImages, setNewImages] = useState([]);
  const [audio, setAudio] = useState(note.audio || "");
  const [activeTab, setActiveTab] = useState("Notes");
  const [isLoading, setIsLoading] = useState(false); // loading state
  const fileInputRef = useRef(null);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const time = new Date(note.updatedAt).toLocaleString("en-US", options);

  const handleClose = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    setIsLoading(true); // set loading to true
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("transcript", transcript);
    formData.append("isFavorite", isFavorite);
    if (existingImages.length === 0) {
      formData.append("existingImages", JSON.stringify([])); // Append an empty array as a JSON string
    } else {
      formData.append("existingImages", JSON.stringify(existingImages)); // Append the array as a JSON string
    }
    newImages.forEach((file) => formData.append("newImages", file));
    try {
      await updateNote(note._id, formData);
      onUpdate();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating note:", error);
    } finally {
      toast.success("Note updated successfully");
      setIsLoading(false); // reset loading state
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      setNewImages((prev) => [...prev, ...files]);
    }
  };

  const handleImageDelete = (index) => {
    const newImages = existingImages.filter((_, i) => i !== index);
    setexistingImages(newImages);
  };

  if (!isModalOpen) return null;

  return (
<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
  <div
    className={`relative 
      bg-white 
      rounded-lg 
      shadow-lg 
      w-[500px]
      p-4
      ${isFullscreen ? "h-screen w-full rounded-none p-0" : ""}`} // Added p-0 for fullscreen
  >
    {/* Title and Icons Row */}
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center">
        <div className="text-xl font-medium">{title}</div>
        <PencilIcon
          className="text-gray-800 cursor-pointer ml-2"
          size={18}
          onClick={() => setTitle(prompt("Enter new title:", title))}
        />
      </div>

      <div className="flex items-center space-x-3">
        {isFullscreen ? (
          <Minimize2
            onClick={() => setIsFullscreen(false)}
            className="cursor-pointer text-gray-600 hover:text-black"
            size={24}
          />
        ) : (
          <Maximize2
            onClick={() => setIsFullscreen(true)}
            className="cursor-pointer text-gray-600 hover:text-black"
            size={24}
          />
        )}
        {isFavorite ? (
          <Heart
            onClick={() => setIsFavorite(false)}
            className="cursor-pointer text-red-400 hover:text-red-600"
            size={24}
            fill="currentColor"
          />
        ) : (
          <Heart
            onClick={() => setIsFavorite(true)}
            className="cursor-pointer text-gray-600 hover:text-red-400"
            size={24}
          />
        )}
        <X
          onClick={handleClose}
          className="cursor-pointer text-gray-600 hover:text-red-500"
          size={28}
        />
      </div>
    </div>

    <div className="text-gray-500 text-sm mt-2">{time}</div>

    {/* Tabs */}
    <div className="flex border-b mb-3">
      {["Notes", "Audio", "Images"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`py-2 px-4 transition-colors duration-200 ${
            activeTab === tab
              ? "border-b-2 border-gray-800 text-gray-800"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>

    {/* Content Areas */}
    <div className="mt-3">
      {activeTab === "Notes" && (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`w-full ${isFullscreen? "h-1/2 " : "" } px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 h-24 resize-none`}
          placeholder="Enter your notes here"
        />
      )}
      {audio && activeTab === "Audio" && (
        <>
          <div className="mt-3 mb-3 flex items-center justify-between space-x-3">
            <audio controls className="w-full audio">
              <source src={audio} type="audio/mpeg" />
              Your browser does not support the audio tag.
            </audio>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 border min-h-[150px] rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 h-24 resize-none"
            placeholder="Enter transcript here"
          />
        </>
      )}
      {!audio && activeTab === "Audio" && (
        <div className="mt-3 text-gray-600 text-center min-h-[150px]">
          No audio recording available
        </div>
      )}
    </div>

    {activeTab === "Images" && (
      <>
        {/* Images */}
        <div className="mt-3 grid grid-cols-2 gap-2 min-h-[150px]">
          {existingImages.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img}
                alt="Note"
                className="w-full h-20 object-contain rounded transition-opacity group-hover:opacity-80"
              />
              <button
                className="absolute top-1 left-[55%] bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => handleImageDelete(index)}
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
          {newImages &&
            newImages.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Note"
                  className="w-full h-20 object-contain rounded transition-opacity group-hover:opacity-80"
                />
                <button
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => handleImageDelete(index)}
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          <div
            className="flex justify-center items-center border-2 border-dashed border-gray-300 rounded h-20 cursor-pointer"
            onClick={handleImageClick}
          >
            <PlusIcon className="text-gray-800 mr-2" size={20} />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              multiple
            />
            <span className="text-gray-600">Add Image</span>
          </div>
        </div>
      </>
    )}

    <div className="flex justify-between mt-4 space-x-3">
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-black transition-colors duration-200"
      >
        {isLoading ? (
          <span>Saving...</span>
        ) : (
          <span className="font-semibold">Save</span>
        )}
      </button>
    </div>

    {isLoading && (
      <div className="absolute inset-0 bg-black/50 flex justify-center items-center z-10">
        <div className="text-white">Loading...</div>
      </div>
    )}
  </div>
</div>
  );
};

export default NoteModal;
