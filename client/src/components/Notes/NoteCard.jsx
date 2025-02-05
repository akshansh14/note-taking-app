import React, { useState } from "react";
import { deleteNote } from "../../services/api";
import { Copy, Play, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const NoteCard = ({ note, onUpdate,openModal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(note.content);
  };
  const handleDelete = async () => {
    try {
     
        await deleteNote(note._id),
        toast.success("Note deleted successfully");
      onUpdate();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const formatDate = (date) => {
    const noteDate = new Date(date);
    return noteDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
  className="bg-white hover:bg-gray-50 cursor-pointer p-4 pb-6 rounded-lg relative shadow-md transition duration-200"
  onClick={() => openModal(note)}
  role="button" // Accessibility improvement
  tabIndex={0} // Make the div focusable
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsModalOpen(true); // Open modal on Enter or Space key
    }
  }}
>
  {/* Header with Date and Audio Duration */}
  <div className="flex items-center justify-between mb-1">
    <span className="text-gray-500 text-xs">{formatDate(note.createdAt)}</span>
    {note.audio && (
      <div className="flex items-center gap-1 text-sm text-black">
        <Play className="w-4 h-4" />
      </div>
    )}
  </div>

  {/* Title */}
  <h3 className="font-medium text-xl text-black mb-2">{note.title}</h3>

  {/* Preview text */}
  <p className="text-gray-500 text-sm mb-3">
    {note.content.length > 60
      ? `${note.content.substring(0, 60)}...`
      : note.content}
  </p>

  {/* Action Buttons */}
  <div className="flex absolute bottom-2 right-5 gap-4 items-center mt-3 pt-2">
    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent event propagation
        handleCopy();
      }}
      className="flex items-center gap-x-4 text-gray-600 hover:text-gray-800 transition"
      aria-label="Copy note"
    >
      <Copy className="w-4 h-4" />
    </button>

    <button
      onClick={(e) => {
        e.stopPropagation(); // Prevent event propagation
        handleDelete();
      }}
      className="flex items-center gap-2 text-gray-600 hover:text-red-700 transition"
      aria-label="Delete note"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>

</div>
  );
};

export default NoteCard;
