import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  quizLink: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get<Quiz[]>("/quizzes");
        setQuizzes(res.data);
      } catch (err) {
        // noop for now
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("qp_token");
    localStorage.removeItem("qp_user");
    navigate("/teacher/login");
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const handleCopy = async (quiz: Quiz) => {
    const url = `${origin}/quiz/${quiz.quizLink}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(quiz._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore copy errors
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Your Quizzes</h1>
          <p className="text-sm text-slate-400">
            Create, manage, and share secure proctored quizzes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/teacher/quizzes/new")}
            className="inline-flex items-center rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
          >
            New Quiz
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : quizzes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">
          You have not created any quizzes yet. Start by creating one.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-1 text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr className="bg-slate-900/60">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Share Link</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => {
                const shareUrl = `${origin}/quiz/${q.quizLink}`;
                return (
                  <tr key={q._id} className="rounded-lg bg-slate-900/40 hover:bg-slate-900/70">
                    <td className="px-3 py-2 text-sm font-medium text-slate-100">{q.title}</td>
                    <td className="px-3 py-2 align-top">
                      {q.isPublished ? (
                        <div className="flex items-center gap-2">
                          <code className="max-w-xs truncate text-xs text-slate-300">{shareUrl}</code>
                          <button
                            type="button"
                            onClick={() => handleCopy(q)}
                            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800"
                          >
                            Copy
                          </button>
                          {copiedId === q._id && (
                            <span className="text-xs text-emerald-400">Copied!</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Publish the quiz to generate a shareable link.
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          q.isPublished
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-slate-700/40 text-slate-300"
                        }`}
                      >
                        {q.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-400">
                      {q.createdAt ? new Date(q.createdAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-400">
                      {q.updatedAt ? new Date(q.updatedAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/teacher/quizzes/${q._id}`)}
                          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/quizzes/${q._id}/results`)}
                          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800"
                        >
                          Results
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
