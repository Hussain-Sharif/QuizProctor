import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface SubmissionResponse {
  submissionId: string;
  totalScore: number;
  maxScore: number;
  pass: boolean;
  status: string;
}

interface LocationState {
  submission?: SubmissionResponse;
  violationCount?: number;
  timeTaken?: number;
  error?: string;
}

const ResultsScreen: React.FC = () => {
  const { quizLink } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  if (state.error) {
    return (
      <div style={{ maxWidth: 600, margin: "20px auto" }}>
        <h1>Quiz Submission</h1>
        <p style={{ color: "red" }}>{state.error}</p>
        <button onClick={() => navigate(`/quiz/${quizLink}`)}>Back to quiz</button>
      </div>
    );
  }

  if (!state.submission) {
    return (
      <div style={{ maxWidth: 600, margin: "20px auto" }}>
        <h1>Quiz Results</h1>
        <p>Results not available. Please start the quiz again.</p>
        <button onClick={() => navigate(`/quiz/${quizLink}`)}>Back to quiz</button>
      </div>
    );
  }

  const { submission, violationCount = 0, timeTaken = 0 } = state;
  const percent = submission.maxScore
    ? ((submission.totalScore / submission.maxScore) * 100).toFixed(2)
    : "0.00";

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h1>Quiz Results</h1>
      <p>
        Score: {submission.totalScore} / {submission.maxScore} ({percent}%)
      </p>
      <p>Status: {submission.status}</p>
      <p>Result: {submission.pass ? "Pass" : "Fail"}</p>
      <p>Violations (tab switches / fullscreen exits): {violationCount}</p>
      <p>Time taken: {timeTaken} seconds</p>
      <p>Thank you for participating.</p>
      <button onClick={() => navigate(`/quiz/${quizLink}`)}>Back to quiz landing</button>
    </div>
  );
};

export default ResultsScreen;
