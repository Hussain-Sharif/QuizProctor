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
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="app-title">Your Quizzes</div>
          <div className="app-subtitle">Create, manage, and share secure proctored quizzes.</div>
        </div>
        <div>
          <button onClick={() => navigate("/teacher/quizzes/new")}>New Quiz</button>
          <button onClick={handleLogout} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : quizzes.length === 0 ? (
        <p style={{ marginTop: 16 }}>You have not created any quizzes yet. Start by creating one.</p>
      ) : (
        <table className="table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Share Link</th>
              <th>Published</th>
              <th>Created</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => {
              const shareUrl = `${origin}/quiz/${q.quizLink}`;
              return (
                <tr key={q._id}>
                  <td>{q.title}</td>
                  <td>
                    {q.isPublished ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <code style={{ fontSize: "0.8rem" }}>{shareUrl}</code>
                        <button type="button" onClick={() => handleCopy(q)}>
                          Copy
                        </button>
                        {copiedId === q._id && <span>Copied!</span>}
                      </div>
                    ) : (
                      <span className="app-subtitle">Publish the quiz to generate a shareable link.</span>
                    )}
                  </td>
                  <td>
                    <span className={q.isPublished ? "badge badge-green" : "badge badge-red"}>
                      {q.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td>{q.createdAt ? new Date(q.createdAt).toLocaleString() : "-"}</td>
                  <td>{q.updatedAt ? new Date(q.updatedAt).toLocaleString() : "-"}</td>
                  <td>
                    <button onClick={() => navigate(`/teacher/quizzes/${q._id}`)}>Edit</button>
                    <button
                      onClick={() => navigate(`/teacher/quizzes/${q._id}/results`)}
                      style={{ marginLeft: 4 }}
                    >
                      Results
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;
