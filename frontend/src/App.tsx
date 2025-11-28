import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import TeacherLogin from "./pages/teacher/TeacherLogin";
import TeacherRegister from "./pages/teacher/TeacherRegister";
import Dashboard from "./pages/teacher/Dashboard";
import QuizBuilder from "./pages/teacher/QuizBuilder";
import ResultsView from "./pages/teacher/ResultsView";
import QuizLanding from "./pages/student/QuizLanding";
import RegistrationForm from "./pages/student/RegistrationForm";
import QuizInterface from "./pages/student/QuizInterface";
import ResultsScreen from "./pages/student/ResultsScreen";

const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("qp_token") : null;
  if (!token) {
    return <Navigate to="/teacher/login" replace />;
  }
  return children;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/teacher/register" element={<TeacherRegister />} />
      <Route
        path="/teacher/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/teacher/quizzes/new"
        element={
          <RequireAuth>
            <QuizBuilder />
          </RequireAuth>
        }
      />
      <Route
        path="/teacher/quizzes/:id"
        element={
          <RequireAuth>
            <QuizBuilder />
          </RequireAuth>
        }
      />
      <Route
        path="/teacher/quizzes/:id/results"
        element={
          <RequireAuth>
            <ResultsView />
          </RequireAuth>
        }
      />

      <Route path="/quiz/:quizLink" element={<QuizLanding />} />
      <Route path="/quiz/:quizLink/register" element={<RegistrationForm />} />
      <Route path="/quiz/:quizLink/take" element={<QuizInterface />} />
      <Route path="/quiz/:quizLink/results" element={<ResultsScreen />} />

      <Route path="*" element={<Navigate to="/teacher/login" replace />} />
    </Routes>
  );
};

export default App;
