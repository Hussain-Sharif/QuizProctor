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
      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-red-500/40 bg-red-950/40 px-6 py-5 text-sm text-red-100">
        <h1 className="text-lg font-semibold">Quiz</h1>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!quiz) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
      <h1 className="text-2xl font-semibold tracking-tight">{quiz.title}</h1>
      {quiz.description && <p className="mt-1 text-sm text-slate-300">{quiz.description}</p>}
      <div className="mt-4 space-y-3 text-sm">
        <div>
          <h2 className="text-base font-semibold">Rules</h2>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
            <li>Time limit: {quiz.settings.timeLimitMinutes} minutes</li>
            <li>Maximum tab switches allowed: {quiz.settings.maxTabSwitches}</li>
            <li>Passing score: {quiz.settings.passingPercentage}%</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">
          By starting the quiz, you agree to abide by the anti-cheating policy: no tab
          switching, no exiting fullscreen, and no copying content.
        </p>
      </div>
      {alreadyAttempted ? (
        <p className="mt-4 text-sm text-red-400">
          You have already completed this quiz.
        </p>
      ) : (
        <button
          onClick={() => navigate(`/quiz/${quizLink}/register`)}
          className="mt-5 inline-flex items-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default QuizLanding;
