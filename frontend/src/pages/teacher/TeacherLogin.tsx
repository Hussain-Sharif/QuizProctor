import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

const TeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("qp_token", res.data.token);
      localStorage.setItem("qp_user", JSON.stringify(res.data.user));
      navigate("/teacher/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold tracking-tight">Teacher Login</h1>
        <p className="mt-1 text-sm text-slate-400">
          Sign in to manage your quizzes and monitor results.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-cyan-400 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          New here?{" "}
          <a href="/teacher/register" className="font-medium text-cyan-400 hover:text-cyan-300">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}

export default TeacherLogin;
