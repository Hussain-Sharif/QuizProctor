import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client";

interface Violation {
  type: string;
  timestamp: string;
}

interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
}

interface Submission {
  _id: string;
  studentFormData: Record<string, any>;
  answers: Answer[];
  violations: Violation[];
  totalScore: number;
  maxScore: number;
  status: "completed" | "terminated";
  timeTaken: number;
  submittedAt: string;
}

const ResultsView: React.FC = () => {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await api.get<Submission[]>(`/quizzes/${id}/submissions`);
        setSubmissions(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const downloadCsv = async () => {
    if (!id) return;
    const res = await api.get(`/quizzes/${id}/submissions/csv`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `quiz-${id}-submissions.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "20px auto" }}>
      <h1>Quiz Results</h1>
      <button onClick={downloadCsv}>Download CSV</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", marginTop: 16 }}>
          <thead>
            <tr>
              <th>Student</th>
              <th>Score</th>
              <th>Status</th>
              <th>Tab Switches</th>
              <th>Total Violations</th>
              <th>Time Taken (s)</th>
              <th>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const name = (s.studentFormData && s.studentFormData.name) || "";
              const tabSwitchCount = s.violations.filter(
                (v) => v.type === "tab_switch"
              ).length;
              return (
                <tr key={s._id}>
                  <td>{name}</td>
                  <td>
                    {s.totalScore} / {s.maxScore}
                  </td>
                  <td>{s.status}</td>
                  <td>{tabSwitchCount}</td>
                  <td>{s.violations.length}</td>
                  <td>{s.timeTaken}</td>
                  <td>{new Date(s.submittedAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ResultsView;
