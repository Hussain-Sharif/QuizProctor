import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

interface Settings {
  timeLimitMinutes: number;
  maxTabSwitches: number;
  passingPercentage: number;
}

interface QuestionMeta {
  _id: string;
  questionText: string;
  questionType: string;
  options?: string[];
  positiveMarks: number;
  negativeMarks: number;
}

interface QuizResponse {
  _id: string;
  title: string;
  description?: string;
  formFields: any[];
  questions: QuestionMeta[];
  settings: Settings;
}

const QuizLanding: React.FC = () => {
  const { quizLink } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await api.get<QuizResponse>(`/quiz/${quizLink}`);
        setQuiz(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Unable to load quiz");
      }
    };
    loadQuiz();
  }, [quizLink]);

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  if (!quiz) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "20px auto" }}>
      <h1>{quiz.title}</h1>
      {quiz.description && <p>{quiz.description}</p>}
      <h2>Rules</h2>
      <ul>
        <li>Time limit: {quiz.settings.timeLimitMinutes} minutes</li>
        <li>Maximum tab switches allowed: {quiz.settings.maxTabSwitches}</li>
        <li>Passing score: {quiz.settings.passingPercentage}%</li>
      </ul>
      <p>
        By starting the quiz, you agree to abide by the anti-cheating policy: no tab
        switching, no exiting fullscreen, and no copying content.
      </p>
      <button onClick={() => navigate(`/quiz/${quizLink}/register`)}>Continue</button>
    </div>
  );
};

export default QuizLanding;
