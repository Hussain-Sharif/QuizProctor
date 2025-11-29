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
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Teacher Registration</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create an account to start creating secure quizzes.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1 text-sm">
            <label className="block text-slate-200">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label className="block text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label className="block text-slate-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/60"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-emerald-400">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <a href="/teacher/login" className="font-medium text-cyan-400 hover:text-cyan-300">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default TeacherRegister;
