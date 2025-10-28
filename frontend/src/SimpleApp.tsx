import React, { useState } from "react";
import axios from "axios";

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  firstName: string;
  lastName: string;
}

const SimpleApp: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<RegisterForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.status === "OK") {
        setToken(response.data.token);
        setUser(response.data.user);
        setMessage("Zalogowano pomyślnie!");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.message || "Błąd logowania");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/register", {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (response.data.status === "OK") {
        setMessage("Zarejestrowano pomyślnie! Możesz się teraz zalogować.");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Register error:", error);
      setMessage(error.response?.data?.message || "Błąd rejestracji");
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setMessage("Wylogowano");
    setFormData({ email: "", password: "", firstName: "", lastName: "" });
  };

    if (isLoggedIn) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>🏘️ Osiedlowo - Dashboard</h1>
        <div
          style={{
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2>
            Witaj, {user.firstName} {user.lastName}!
          </h2>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>ID:</strong> {user.id}
          </p>
          <p>
            <strong>Token:</strong> {token.substring(0, 50)}...
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Wyloguj
          </button>
        </div>
        {message && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
            }}
          >
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>🏘️ Osiedlowo</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setIsLogin(true)}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: isLogin ? "#007bff" : "#f8f9fa",
            color: isLogin ? "white" : "#6c757d",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logowanie
        </button>
        <button
          onClick={() => setIsLogin(false)}
          style={{
            padding: "10px 20px",
            backgroundColor: !isLogin ? "#007bff" : "#f8f9fa",
            color: !isLogin ? "white" : "#6c757d",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Rejestracja
        </button>
      </div>

      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Email:
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Hasło:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          />
        </div>

        {!isLogin && (
          <>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Imię:
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                Nazwisko:
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          {isLogin ? "Zaloguj się" : "Zarejestruj się"}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            backgroundColor: message.includes("Błąd") ? "#f8d7da" : "#d4edda",
            border: `1px solid ${
              message.includes("Błąd") ? "#f5c6cb" : "#c3e6cb"
            }`,
            borderRadius: "4px",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default SimpleApp;