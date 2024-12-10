import React, { useState } from "react";
import "./LoginForm.css";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom"; // useNavigate'i import ettik

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // useNavigate hook'u ile yönlendirme işlemi yapacağız

  const handleLogin = async (e) => {
    e.preventDefault();
    const userData = {
      username: username,
      password: password,
    };

    try {
      const response = await fetch(
        "https://donanimeasyleapi.azurewebsites.net/api/Auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        // Giriş başarılı olduğunda token'ı ve username'ı localStorage'a kaydediyoruz
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("username", username); // username'ı da localStorage'a ekliyoruz
        navigate("/home"); // Login işlemi başarılı ise home sayfasına yönlendiriyoruz
      } else {
        alert(responseData.message);
        console.error("Error during login:", responseData);
        setMessage("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setMessage("An error occurred during login.");
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FaLock className="icon" />
        </div>

        <div className="remember-forgot">
          <label>
            <input type="checkbox" />
            Remember me
          </label>
        </div>

        <button type="submit">Login</button>

        <div className="register-link">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
