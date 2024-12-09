import React, { useState } from "react";
import "./RegisterForm.css";
import { FaUser } from "react-icons/fa";
import { FaLock } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom"; // useNavigate'i import ettik

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // useNavigate hook'u ile yönlendirme işlemi yapacağız

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      email: email,
      username: username,
      password: password,
    };

    try {
      const response = await fetch("https://localhost:7117/api/Auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Registration successful:", responseData);

        alert("Register Successful");

        navigate("/login"); // Login sayfası
      } else {
        const responseData = await response.json();
        alert(responseData.message);
        console.error("Error during registration:", responseData);
        setMessage("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setMessage("An error occurred during registration.");
    }
  };

  return (
    <div className="wrapper">
      <form onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <div className="input-box">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Email güncelleme
          />
          <MdAlternateEmail className="icon" />
        </div>
        <div className="input-box">
          <input
            type="text"
            placeholder="Username"
            required
            minLength="4"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Kullanıcı adı güncelleme
          />
          <FaUser className="icon" />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            required
            pattern="^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
            title="Şifre en az 8 karakter uzunluğunda olmalı, en az bir büyük harf ve bir özel karakter içermelidir."
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Şifre güncelleme
          />
          <FaLock className="icon" />
        </div>
        <button type="submit">Sign Up</button>
        {message && <p className="message">{message}</p>}{" "}
        {/* Hata veya başarı mesajı */}
        <div className="login-link">
          <p>
            Have already an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
