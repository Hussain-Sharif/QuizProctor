import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

interface FormField {
  fieldName: string;
  fieldType: string;
  required: boolean;
  options?: string[];
}

interface QuizMeta {
  formFields: FormField[];
}

const RegistrationForm: React.FC = () => {
  const { quizLink } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState<FormField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const regKey = `qp_reg_${quizLink}`;
    const existing = localStorage.getItem(regKey);
    if (existing) {
      navigate(`/quiz/${quizLink}/take`, { replace: true });
      return;
    }

    const load = async () => {
      const res = await api.get<QuizMeta & { title: string }>(`/quiz/${quizLink}`);
      setFields(res.data.formFields || []);
    };
    load();
  }, [quizLink, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    for (const f of fields) {
      const key = f.fieldName;
      const value = (values[key] || "").trim();
      if (f.required && !value) {
        setError(`Please fill the required field: ${f.fieldName}`);
        return;
      }
      if (value) {
        if (f.fieldType === "email") {
          const emailRegex = /.+@.+\..+/;
          if (!emailRegex.test(value)) {
            setError(`Please enter a valid email for: ${f.fieldName}`);
            return;
          }
        }
        if (f.fieldType === "number" && isNaN(Number(value))) {
          setError(`Please enter a valid number for: ${f.fieldName}`);
          return;
        }
      }
    }

    localStorage.setItem(`qp_reg_${quizLink}`, JSON.stringify(values));
    navigate(`/quiz/${quizLink}/take`);
  };

  return (
    <div className="card" style={{ maxWidth: 600, margin: "20px auto" }}>
      <h1>Registration</h1>
      <p className="app-subtitle">Provide your details before starting the quiz.</p>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        {fields.map((f) => {
          const key = f.fieldName;
          const value = values[key] || "";
          return (
            <div key={key} style={{ marginBottom: 8 }}>
              <label>
                {f.fieldName}
                {f.required && " *"}
              </label>
              {f.fieldType === "dropdown" || f.fieldType === "radio" ? (
                <select
                  required={f.required}
                  value={value}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                >
                  <option value="">Select...</option>
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.fieldType === "email" ? "email" : "text"}
                  required={f.required}
                  value={value}
                  onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                />
              )}
            </div>
          );
        })}
        <button type="submit">Start Quiz</button>
      </form>
    </div>
  );
};

export default RegistrationForm;
