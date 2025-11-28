import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const TeacherRegister: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      setSuccess("Account created. You can now log in.");
      setTimeout(() => navigate("/teacher/login"), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: "40px auto" }}>
      <h1>Teacher Registration</h1>
      <p className="app-subtitle">Create an account to start creating secure quizzes.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-danger">{error}</p>}
        {success && <p>{success}</p>}
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/teacher/login">Login</a>
      </p>
    </div>
  );
};

export default TeacherRegister;
