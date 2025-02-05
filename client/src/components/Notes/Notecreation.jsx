import React, { useState, useRef, useEffect } from "react";
import { createNote } from "../../services/api";
import { PenLine, Image, Mic, MicOff, Trash } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const NoteCreation = ({ onNoteCreated }) => {
  const [text, setText] = useState("notes");
  const [title, setTitle] = useState("Title");
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [isTransVisible, setisTransVisible] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (audioFile) {
      const newAudioUrl = URL.createObjectURL(audioFile);
      setAudioUrl(newAudioUrl);

      return () => {
        URL.revokeObjectURL(newAudioUrl);
      };
    }
  }, [audioFile]);

  const handleTextChange = (e) => setText(e.target.value);
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleTranscriptChange = (e) => setTranscript(e.target.value);

  const handleImageDelete = (index) => {
    const newImages = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newImages);
  };

  const stopRecordingAndGetAudio = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
          resolve(audioBlob);
        };
        mediaRecorderRef.current.stop();
        if (recognitionRef.current) recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        resolve(audioFile);
      }
    });
  };

  const handleCreateNote = async () => {
    if (text || transcript || isRecording || audioFile || imageFiles.length > 0) {
      setIsLoading(true);

      try {
        const finalAudioBlob = isRecording ? await stopRecordingAndGetAudio() : audioFile;

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", text);
        formData.append("transcript", transcript);
        formData.append("userId", user.id);

        imageFiles.forEach((file) => formData.append("images", file));
        if (finalAudioBlob) formData.append("audio", finalAudioBlob);

        await createNote(formData);
        console.log("Note created successfully");
        toast.success("Note Created")
        
        setAudioUrl(null);
        setTitle("Title");
        setText("Notes");
        setTranscript("");
        setAudioFile(null);
        setImageFiles([]);
        setIsTextInputVisible(false);
        setisTransVisible(false);
        onNoteCreated();
      } catch (error) {
        console.error("Error creating note:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageClick = () => fileInputRef.current?.click();
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) setImageFiles((prev) => [...prev, ...files]);
  };

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }
    setisTransVisible(true);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          setTranscript(event.results[i][0].transcript);
        }
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event) =>
      console.error("Speech recognition error:", event.error);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });
            setAudioFile(audioBlob);
          };

          mediaRecorder.start();
          setIsRecording(true);

          setTimeout(() => {
            stopRecording();
          }, 60000);
        })
        .catch((error) => console.error("Error accessing microphone:", error));
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 mx-auto w-full xl:max-w-[600px] md:max-w-[580px] md:right-0 md:left-40  xl:left-56">
      {audioUrl && (
        <div className="mb-4 bg-white rounded-lg shadow-lg p-4">
          <audio controls className="w-full">
            <source src={audioUrl} type="audio/wav" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-4 relative">
        {isTextInputVisible && (
          <div className="space-y-4">
            <input
              value={title}
              onChange={handleTitleChange}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Title"
            />
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Write your note here..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>
        )}

        {isTransVisible && (
          <div className="mt-4">
            <textarea
              value={transcript}
              onChange={handleTranscriptChange}
              placeholder="Write your transcript here..."
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
          </div>
        )}

        <div className="relative">
          <div className="mt-4 flex items-center gap-2">
            <button
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={() => setIsTextInputVisible((prev) => !prev)}
            >
              <PenLine className="w-5 h-5" />
            </button>

            <button
              className="p-2 text-gray-500 relative hover:bg-gray-100 rounded-full transition-colors duration-200"
              onClick={handleImageClick}
            >
              <Image className="w-5 h-5" />
              <span className="absolute -right-1 w-6 h-6 bg-indigo-500 text-white font-bold rounded-2xl -top-3">
                {imageFiles.length}
              </span>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                multiple
              />
            </button>

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center gap-2 transition-colors duration-200"
            >
              {isRecording ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span className="lg:block hidden">Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span className="lg:block hidden">Start Recording</span>
                </>
              )}
            </button>

            <button
              onClick={handleCreateNote}
              disabled={isLoading}
              className="ml-2 px-4 py-2 bg-[#4f46e5] text-white rounded-full hover:bg-[#4f46e5] transition-colors duration-200"
            >
              {isLoading ? "Saving..." : "Save Note"}
            </button>
          </div>

          {imageFiles.length > 0 && (
            <div className="mt-4 absolute md:-top-[300px] md:-left-[350px] -top-[200px] left-[300px] bg-gray-100 bg-dotted p-[50px]">
              <div className="grid md:grid-cols-2 gap-2 grid-cols-1 w-[200px]">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="md:w-20 md:h-20 w-10 h-10 object-contain border-dashed border-black rounded-lg"
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => handleImageDelete(index)}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
              {imageFiles.length > 5 && screen.width >= 1024 && 
                alert("You can only upload 5 images at a time")}
              {imageFiles.length > 5 && screen.width < 1024 && 
                alert("You can only upload 5 images at a time Please RELOAD")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCreation;