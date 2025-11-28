import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import toast, { Toaster } from "react-hot-toast";

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
  const [success, setSuccess] = useState<string | null>(null);

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
        toast.error(err.response?.data?.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [id]);

  const handleSave = async (publish: boolean) => {
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError("Quiz title is required.");
      toast.error("Quiz title is required.")
      return;
    }
    if (formFields.length === 0) {
      setError("Please add at least one field for the form.");
      toast.error("Please add at least one field for the form.")
      return;
    }
    if (questions.length === 0) {
      setError("Please add at least one question.");
      toast.error("Please add at least one question.")
      return;
    }
    const invalid = questions.find(
      (q) => !q.questionText.trim() || !q.correctAnswer.trim() || (q.questionType === "mcq" && (!q.options || q.options.length === 0))
    );
    if (invalid) {
      setError("Each question must have text, a correct answer, and options for MCQ.");
      toast.error("Each question must have text, a correct answer, and options for MCQ.")
      return;
    }
    setLoading(true);
    try {
      const wasPublished = isPublished;
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
        setIsPublished(publish ? true : wasPublished);
        if (publish) {
          setSuccess(wasPublished ? "Changes saved and quiz re-published." : "Quiz published successfully.");
          toast.success(wasPublished ? "Changes saved and quiz re-published." : "Quiz published successfully.");
        } else {
          setSuccess("Changes saved as draft.");
          toast.success("Changes saved as draft.");
        }
      } else {
        const res = await api.post("/quizzes", payload);
        const created = res.data as QuizPayload & { _id: string; quizLink: string };
        setIsPublished(publish);
        if (publish) {
          setSuccess("Quiz created and published. You can share the link from the dashboard.");
          toast.success("Quiz created and published. You can share the link from the dashboard.");
        } else {
          setSuccess("Draft quiz created. You can publish it later from this page.");
          toast.success("Draft quiz created. You can publish it later from this page.");
        }
        navigate("/teacher/quizzes/" + created._id, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save quiz");
      toast.error(err.response?.data?.message || "Failed to save quiz");
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

  const addFormField = () => {
    setFormFields((prev) => [
      ...prev,
      { fieldName: "", fieldType: "text", required: false, options: [] },
    ]);
  };

  return (
    <div className="card">
      <Toaster position="top-right"/>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>{id ? "Edit Quiz" : "Create Quiz"}</h1>
          <p className="app-subtitle">
            Configure quiz details, registration form, questions, and proctoring settings.
          </p>
        </div>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {success && <p>{success}</p>}

      <section style={{ marginTop: 16 }}>
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
        <h2>Registration Form Fields</h2>
        <p className="app-subtitle">
          These fields will be shown to students before the quiz starts (e.g. Name, Email,
          Roll Number).
        </p>
        <button type="button" onClick={addFormField}>
          Add Field
        </button>
        <div
        className="flex gap-2 w-full justify-center  flex-wrap"
        >
             {formFields.map((f, idx) => (
          <div key={idx} className="w-45 flex  flex-col gap-2" style={{ marginTop: 8 }}>
            <label>Field Label</label>
            <input
              type="text"
              value={f.fieldName}
              onChange={(e) => {
                const next = [...formFields];
                next[idx].fieldName = e.target.value;
                setFormFields(next);
              }}
            />
            <label>Type</label>
            <select
              value={f.fieldType}
              onChange={(e) => {
                const next = [...formFields];
                next[idx].fieldType = e.target.value;
                setFormFields(next);
              }}
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="number">Number</option>
              <option value="dropdown">Dropdown</option>
              <option value="radio">Radio</option>
            </select>
            <div
            className="flex justify-start items-start "
            >
              <label htmlFor={`${idx}-required`}>Required</label>
              <input
              className="m-0"
                id={`${idx}-required`}
                type="checkbox"
                checked={f.required}
                onChange={(e) => {
                  const next = [...formFields];
                  next[idx].required = e.target.checked;
                  setFormFields(next);
                }}
              />
            </div>
            {(f.fieldType === "dropdown" || f.fieldType === "radio") && (
              <>
                <label>Options (comma separated)</label>
                <input
                  type="text"
                  value={(f.options || []).join(",")}
                  onChange={(e) => {
                    const next = [...formFields];
                    next[idx].options = e.target.value
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean);
                    setFormFields(next);
                  }}
                />
              </>
            )}
          </div>
        ))}
        </div>
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
                <label>Options</label>
                {(q.options || []).map((opt, optIdx) => (
                  <div key={optIdx} style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...questions];
                        const opts = [...(next[idx].options || [])];
                        opts[optIdx] = e.target.value;
                        next[idx].options = opts;
                        setQuestions(next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...questions];
                        const opts = [...(next[idx].options || [])];
                        opts.splice(optIdx, 1);
                        next[idx].options = opts;
                        setQuestions(next);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  style={{ marginTop: 4 }}
                  onClick={() => {
                    const next = [...questions];
                    const opts = [...(next[idx].options || [])];
                    opts.push("");
                    next[idx].options = opts;
                    setQuestions(next);
                  }}
                >
                  Add Option
                </button>
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

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button type="button" disabled={loading} onClick={() => handleSave(false)}>
          Save as Draft
        </button>
        <button type="button" disabled={loading} onClick={() => handleSave(true)}>
          {isPublished ? "Save & Re-Publish" : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default QuizBuilder;
