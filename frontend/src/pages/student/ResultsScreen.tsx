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
      <div className="card" style={{ maxWidth: 600, margin: "20px auto" }}>
        <h1>Quiz Submission</h1>
        <p className="text-danger">{state.error}</p>
        <button onClick={() => navigate(`/quiz/${quizLink}`)}>Back to quiz landing</button>
      </div>
    );
  }

  if (!state.submission) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: "20px auto" }}>
        <h1>Quiz Results</h1>
        <p>Results not available.</p>
        <button onClick={() => navigate(`/quiz/${quizLink}`)}>Back to quiz landing</button>
      </div>
    );
  }

  const { submission, violationCount = 0, timeTaken = 0 } = state;
  const percent = submission.maxScore
    ? ((submission.totalScore / submission.maxScore) * 100).toFixed(2)
    : "0.00";

  return (
    <div className="card" style={{ maxWidth: 600, margin: "20px auto" }}>
      <h1>Quiz Results</h1>
      <p>
        Score: {submission.totalScore} / {submission.maxScore} ({percent}%)
      </p>
      <p>Status: {submission.status}</p>
      <p>Result: {submission.pass ? "Pass" : "Fail"}</p>
      <p>Violations recorded (tab switches / fullscreen exits): {violationCount}</p>
      <p>Time taken: {timeTaken} seconds</p>
      {submission.status === "terminated" && (
        <p className="text-danger">
          Your quiz was terminated due to exceeding the allowed number of violations.
        </p>
      )}
      <p>Thank you for participating.</p>
      <button onClick={() => navigate(`/quiz/${quizLink}`)}>Back to quiz landing</button>
    </div>
  );
};

export default ResultsScreen;
