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
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  useEffect(() => {
    const attemptKey = `qp_attempt_${quizLink}`;
    const attempted = typeof window !== "undefined" ? localStorage.getItem(attemptKey) : null;
    if (attempted) {
      setAlreadyAttempted(true);
      setError("You have already attempted this quiz and cannot take it again.");
      return;
    }

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

  if (error && !quiz) {
    return (
      <div className="card" style={{ maxWidth: 800, margin: "20px auto" }}>
        <h1>Quiz</h1>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return <p>Loading...</p>;
  }

  return (
    <div className="card" style={{ maxWidth: 800, margin: "20px auto" }}>
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
      {alreadyAttempted ? (
        <p className="text-danger" style={{ marginTop: 8 }}>
          You have already completed this quiz.
        </p>
      ) : (
        <button onClick={() => navigate(`/quiz/${quizLink}/register`)}>Continue</button>
      )}
    </div>
  );
};

export default QuizLanding;
