import './App.css';
import LoginForm from './Components/LoginForm/LoginForm';
import RegisterForm from './Components/RegisterForm/RegisterForm';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from './Components/HomePage/HomePage';
import ComputersPage from './Components/Computers/ComputersPage';
import PrivateRoute from "./Components/Services/PrivateRoute";
import Messages from "./Components/Messages/Messages";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Private Routes */}

        <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
        <Route path="/computers" element={<PrivateRoute element={<ComputersPage />} />} />
        <Route path="/messages" element={<Messages />} />

        {/* Redirect to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 404 Not Found Page */}
        <Route path="*" element={<div style={{ textAlign: "center", marginTop: "50px" }}><h1>404</h1><p>Page Not Found</p></div>} />
      </Routes>
    </Router>
  );
}

export default App;
