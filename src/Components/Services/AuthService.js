const API_URL = "https://localhost:7117/api/Auth"; // Updated base URL


// Login fonksiyonu
export const login = async (username, password) => {

  try {

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);


    }
    return await response.json(); // Token ve mesajı döndürür
  } catch (error) {
    console.error("Login failed:", error.message);
    throw error;
  }
};

// Register fonksiyonu
export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    return await response.json(); // Kayıt başarılı mesajını döndürür
  } catch (error) {
    console.error("Registration failed:", error.message);
    throw error;
  }
};
