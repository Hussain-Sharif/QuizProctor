import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

interface FormFieldMeta {
  fieldName: string;
  fieldType: string;
  required: boolean;
}

const ResultsView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState<FormFieldMeta[]>([]);
  const [quizTitle, setQuizTitle] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [subsRes, quizRes] = await Promise.all([
          api.get<Submission[]>(`/quizzes/${id}/submissions`),
          api.get<{ title: string; formFields: FormFieldMeta[] }>(`/quizzes/${id}`),
        ]);
        setSubmissions(subsRes.data);
        setQuizTitle(quizRes.data.title || "Quiz Results");
        setFields(quizRes.data.formFields || []);
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
    <div className="card" style={{ maxWidth: 1100, margin: "20px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>{quizTitle || "Quiz Results"}</h1>
          <p className="app-subtitle">
            View how each student filled the registration form and performed in the quiz.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => navigate(-1)}>
            Back
          </button>
          <button type="button" onClick={downloadCsv}>
            Download CSV
          </button>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : submissions.length === 0 ? (
        <p style={{ marginTop: 16 }}>No submissions yet.</p>
      ) : (
        <table className="table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f.fieldName}>{f.fieldName}</th>
              ))}
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
              const tabSwitchCount = s.violations.filter((v) => v.type === "tab_switch").length;
              return (
                <tr key={s._id}>
                  {fields.map((f) => (
                    <td key={f.fieldName}>{s.studentFormData?.[f.fieldName] ?? ""}</td>
                  ))}
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
}

export default ResultsView;
