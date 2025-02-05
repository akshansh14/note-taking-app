import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import NoteList from "./components/Notes/NoteList";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/notes" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/notes" /> : <Signup />} />
        <Route path="/notes" element={user ? <NoteList /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/notes" : "/signup"} />} />
      </Routes>
    </div>
  );
}

export default App;
