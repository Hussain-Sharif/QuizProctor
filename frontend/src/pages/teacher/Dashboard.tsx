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
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Your Quizzes</h1>
        <div>
          <button onClick={() => navigate("/teacher/quizzes/new")}>New Quiz</button>
          <button onClick={handleLogout} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </div>
      </header>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", marginTop: 16 }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Link</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => (
              <tr key={q._id}>
                <td>{q.title}</td>
                <td>
                  <code>{q.quizLink}</code>
                </td>
                <td>{q.isPublished ? "Yes" : "No"}</td>
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;
