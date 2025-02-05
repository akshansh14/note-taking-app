import React, { useState, useEffect } from "react";
import { getNotes } from "../../services/api";
import NoteCard from "./NoteCard";
import NoteModal from "./NoteModal"
import NoteCreation from "./Notecreation";
import { ArrowDownUp, Home, LogOut, NotebookPen, Star, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeTab, setActiveTab] = useState("Home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { logout, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const openModal = (note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedNotes = await getNotes();
      setNotes(fetchedNotes);
      setFilteredNotes(fetchedNotes);
    } catch (error) {
      setError("Failed to fetch notes. Please try again later.");
      console.error("Error fetching notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!notes.length) return;
    
    const filtered = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.transcript.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotes(filtered);
  };

  const handleSort = () => {
    if (!filteredNotes.length) return;

    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    const sorted = [...filteredNotes].sort((a, b) =>
      newOrder === "desc"
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
    setFilteredNotes(sorted);
  };

  const displayedNotes = activeTab === "Home" 
    ? filteredNotes 
    : filteredNotes.filter((note) => note.isFavorite === true);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading notes...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-4 text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchNotes}
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (!displayedNotes.length) {
      return (
        <div className="text-center p-4 text-gray-600">
          {activeTab === "Home" ? "No notes found" : "No favorite notes found"}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedNotes.map((note) => (
          <NoteCard
            key={note._id}
            note={note}
            onUpdate={fetchNotes}
            openModal={openModal}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-screen pb-[120px] relative bg-[url('/main.jpg')] bg-contain bg-center overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative w-64 h-screen bg-white shadow-r-xl shadow-black 
        transition-transform duration-300 ease-in-out z-40
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}
      >
        <div className="p-4 flex-col justify-between h-full flex">
          <div>
            <div className="flex flex-col mt-5 items-start space-x-2 mb-8 border-b-2 border-[#4f46e5] border-dashed">
              <div className="flex flex-row items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center">
                  <NotebookPen className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">My Notes</span>
              </div>
              <div className="flex flex-col items-start space-x-2">
                <span className="text-gray-500">Name</span>
                <span className="text-black text-lg mb-3">{user.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              {["Home", "Favourites"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full py-2 px-4 transition-colors duration-200
                    ${
                      activeTab === tab
                        ? "border-b-2 border-[#4f46e5] text-blue-500"
                        : "text-gray-600 hover:text-gray-800"
                    }
                  `}
                >
                  {tab === "Home" ? (
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-blue-500" />
                      <span className="text-blue-500">{tab}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-[#F0B100]">{tab}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="py-2 text-gray-600 hover:border-t-1 hover:border-b-1 w-full border-black border-dashed transition-all duration-100 border-0 hover:shadow-t-lg hover:shadow-b-lg">
            <button
              className="flex items-center gap-2"
              onClick={() => {
                logout();
                window.location.reload();
              }}
            >
              <LogOut className="w-5 h-5 text-red-500 text-xl" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow container mx-auto px-4 md:px-6 py-8 overflow-y-auto mt-14 md:mt-0">
        {/* Search Bar & Sort Button Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 border-b pb-2 gap-4">
          {/* Search Bar */}
          <div className="relative w-full max-w-md shadow-sm">
            <input
              type="text"
              placeholder="Search notes..."
              aria-label="Search notes"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
                focus:border-indigo-500 transition-all duration-200 ease-in-out 
                text-gray-900 placeholder-gray-500 hover:border-gray-400"
              onChange={(e) => handleSearch(e.target.value)}
              disabled={isLoading}
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 2a6 6 0 014.472 10.011l4.509 4.509a1 1 0 11-1.414 1.414l-4.51-4.509A6 6 0 118 2zm0 2a4 4 0 100 8 4 4 0 000-8z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Sort Button */}
          <button
            onClick={handleSort}
            className="w-full sm:w-auto p-2 rounded-lg items-center flex gap-2 text-gray-600 hover:bg-gray-100 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sort Notes"
            disabled={isLoading || !filteredNotes.length}
          >
            <ArrowDownUp className="w-6 h-6" />
            <span className="text-xl">Sort</span>
          </button>
        </div>

        {renderContent()}

        <NoteCreation onNoteCreated={fetchNotes} />
        {/* Modal for Note Details */}
        {isModalOpen && (
          <NoteModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            note={selectedNote}
            onUpdate={fetchNotes}
          />
        )}
      </div>
    </div>
  );
};

export default NoteList;