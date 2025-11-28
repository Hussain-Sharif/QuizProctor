import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

interface FormField {
  fieldName: string;
  fieldType: string;
  required: boolean;
  options?: string[];
}

interface Question {
  _id?: string;
  questionText: string;
  questionType: "mcq" | "truefalse" | "short";
  options?: string[];
  correctAnswer: string;
  positiveMarks: number;
  negativeMarks: number;
}

interface Settings {
  timeLimitMinutes: number;
  maxTabSwitches: number;
  passingPercentage: number;
  startDate?: string;
  endDate?: string;
}

interface QuizPayload {
  title: string;
  description?: string;
  formFields: FormField[];
  questions: Question[];
  settings: Settings;
  isPublished: boolean;
}

const emptySettings: Settings = {
  timeLimitMinutes: 30,
  maxTabSwitches: 3,
  passingPercentage: 40,
};

const QuizBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadQuiz = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/quizzes/${id}`);
        const q = res.data as QuizPayload & { quizLink: string };
        setTitle(q.title || "");
        setDescription(q.description || "");
        setFormFields(q.formFields || []);
        setQuestions(q.questions || []);
        setSettings(q.settings || emptySettings);
        setIsPublished(q.isPublished);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [id]);

  const handleSave = async (publish: boolean) => {
    setError(null);
    setLoading(true);
    try {
      const payload: QuizPayload = {
        title,
        description,
        formFields,
        questions,
        settings,
        isPublished: publish,
      };

      if (id) {
        await api.put(`/quizzes/${id}`, payload);
      } else {
        await api.post("/quizzes", payload);
      }
      navigate("/teacher/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        questionType: "mcq",
        options: [""],
        correctAnswer: "",
        positiveMarks: 1,
        negativeMarks: 0,
      },
    ]);
  };

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <h1>{id ? "Edit Quiz" : "Create Quiz"}</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <section>
        <h2>Basic Info</h2>
        <input
          type="text"
          placeholder="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </section>

      <section>
        <h2>Questions</h2>
        <button type="button" onClick={addQuestion}>
          Add Question
        </button>
        {questions.map((q, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", marginTop: 8, padding: 8 }}>
            <input
              type="text"
              placeholder="Question text"
              value={q.questionText}
              onChange={(e) => {
                const next = [...questions];
                next[idx].questionText = e.target.value;
                setQuestions(next);
              }}
            />
            <div>
              <label>Type</label>
              <select
                value={q.questionType}
                onChange={(e) => {
                  const next = [...questions];
                  next[idx].questionType = e.target.value as Question["questionType"];
                  setQuestions(next);
                }}
              >
                <option value="mcq">MCQ</option>
                <option value="truefalse">True/False</option>
                <option value="short">Short Answer</option>
              </select>
            </div>
            {q.questionType === "mcq" && (
              <div>
                <label>Options (comma separated)</label>
                <input
                  type="text"
                  value={(q.options || []).join(",")}
                  onChange={(e) => {
                    const next = [...questions];
                    next[idx].options = e.target.value
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean);
                    setQuestions(next);
                  }}
                />
              </div>
            )}
            <div>
              <label>Correct Answer</label>
              <input
                type="text"
                value={q.correctAnswer}
                onChange={(e) => {
                  const next = [...questions];
                  next[idx].correctAnswer = e.target.value;
                  setQuestions(next);
                }}
              />
            </div>
            <div>
              <label>Positive Marks</label>
              <input
                type="number"
                value={q.positiveMarks}
                onChange={(e) => {
                  const next = [...questions];
                  next[idx].positiveMarks = Number(e.target.value) || 0;
                  setQuestions(next);
                }}
              />
              <label>Negative Marks</label>
              <input
                type="number"
                value={q.negativeMarks}
                onChange={(e) => {
                  const next = [...questions];
                  next[idx].negativeMarks = Number(e.target.value) || 0;
                  setQuestions(next);
                }}
              />
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2>Settings</h2>
        <div>
          <label>Time limit (minutes)</label>
          <input
            type="number"
            value={settings.timeLimitMinutes}
            onChange={(e) =>
              setSettings({ ...settings, timeLimitMinutes: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <label>Max tab switches</label>
          <input
            type="number"
            value={settings.maxTabSwitches}
            onChange={(e) =>
              setSettings({ ...settings, maxTabSwitches: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <label>Passing percentage</label>
          <input
            type="number"
            value={settings.passingPercentage}
            onChange={(e) =>
              setSettings({ ...settings, passingPercentage: Number(e.target.value) || 0 })
            }
          />
        </div>
      </section>

      <div style={{ marginTop: 16 }}>
        <button disabled={loading} onClick={() => handleSave(false)}>
          Save as Draft
        </button>
        <button disabled={loading || isPublished} onClick={() => handleSave(true)}>
          {isPublished ? "Already Published" : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default QuizBuilder;
