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

  useEffect(() => {
    const load = async () => {
      const res = await api.get<QuizMeta & { title: string }>(`/quiz/${quizLink}`);
      setFields(res.data.formFields || []);
    };
    load();
  }, [quizLink]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`qp_reg_${quizLink}`, JSON.stringify(values));
    navigate(`/quiz/${quizLink}/take`);
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h1>Registration</h1>
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
