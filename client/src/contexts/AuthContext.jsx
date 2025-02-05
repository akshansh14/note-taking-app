import React, { createContext, useState, useContext, useEffect } from 'react';
import { login, signup } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await api.get("/auth/verify", {
          headers: { Authorization: `Bearer ${token}` }, // Fixed syntax
        });

        if (response.status === 200) {
          setUser(response.data.user);
        } else {
          throw new Error("Invalid token");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const authLogin = async (email, password) => {
    try {
      const result = await login(email, password);
      setUser(result.user);
      localStorage.setItem('token', result.token);
      navigate('/notes');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const authSignup = async (email, password,name) => {
    try {
      const result = await signup(email, password,name);
      setUser(result.user);
      localStorage.setItem('token', result.token);
      navigate('/notes');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const authLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login: authLogin, signup: authSignup, logout: authLogout }}>
      {!loading && children} {/* Ensures content is only rendered after checking authentication */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
