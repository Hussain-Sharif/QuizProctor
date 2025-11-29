import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";

interface Settings {
  timeLimitMinutes: number;
  maxTabSwitches: number;
}

interface Question {
  _id: string;
  questionText: string;
  questionType: "mcq" | "truefalse" | "short" | string;
  options?: string[];
  positiveMarks: number;
  negativeMarks: number;
}

interface QuizResponse {
  _id: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: Settings;
}

interface ViolationEvent {
  type: string;
  timestamp: string;
}

const QuizInterface: React.FC = () => {
  const { quizLink } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [violations, setViolations] = useState<ViolationEvent[]>([]);
  const [violationCount, setViolationCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [violationMessage, setViolationMessage] = useState<string | null>(null);
  const [audioAlret,setAudioAlert]=useState<any>(null)
  const [isFullScreenVoilated,setIsFullScreenVoilated]=useState<Boolean>(false)
  const timerRef = useRef<number | null>(null);

  useEffect(()=>{
    const audio=new Audio("../../../public/audios/timer-alert.wav")
    audio.loop=true
     setAudioAlert(audio) 
      return () => {
    audio.pause();
    audio.currentTime = 0;
    audio.src = ''; // Release the audio resource
  };
  },[]) 

  useEffect(() => {
  // This MASTER cleanup runs when component unmounts for any reason!!!!
  return () => {
    if (audioAlret) {
      audioAlret.pause();
      audioAlret.currentTime = 0;
    }
    // Clear the timer as well
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
  };
}, [audioAlret]);

    const playAlertAudio = useCallback(async () => {
    try {
      if (audioAlret && isActive) {
        audioAlret.currentTime = 0;
        audioAlret.volume = 0.5;
        await audioAlret.play();
      }
    } catch (error) {
      console.log('Alert audio failed:', error);
    }
  }, [audioAlret, isActive]); 


   const stopAlertAudio = useCallback(async () => {
    try {
      if (audioAlret && isActive) await audioAlret.pause();
    } catch (error: any) {
      console.log('Alert audio failed:', error);
    }
  }, [audioAlret, isActive]);


  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const res = await api.get<QuizResponse>(`/quiz/${quizLink}`);
        setQuiz(res.data);
        const totalSeconds = (res.data.settings.timeLimitMinutes || 0) * 60;
        setSecondsLeft(totalSeconds);
      } catch (err) {
        // handle error minimally
      }
    };
    loadQuiz();
  }, [quizLink]);

  useEffect(() => {
    if (!isActive || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit("completed");
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, secondsLeft]);

  const handleTabHidden = useCallback(async () => {
    await playAlertAudio();
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    const evt: ViolationEvent = { 
      type: "tab_switch", 
      timestamp: new Date().toISOString() 
    };
    setViolations((prev) => [...prev, evt]);
    setViolationCount((c) => c + 1);
    setViolationMessage("Tab switch detected. This counts as a violation.");
    await api.post(`/quiz/${quizLink}/log-violation`, { type: "tab_switch" }).catch(() => {});
  }, [quizLink, playAlertAudio]);

  const handleTabVisible = useCallback(async () => {
    await stopAlertAudio();
  }, [stopAlertAudio]);

   useEffect(() => {
    if (!isActive || !quiz) return;

    // Use the memoized functions directly
    window.addEventListener("blur", handleTabHidden);
    window.addEventListener("focus", handleTabVisible);

    console.log("Event listeners added");

    return () => {
      window.removeEventListener("blur", handleTabHidden);
      window.removeEventListener("focus", handleTabVisible);
      console.log("Event listeners removed");
    };
  }, [isActive, quiz, handleTabHidden, handleTabVisible]);

 const handleFullscreenChange = useCallback(async () => {
    if (!quiz || !isActive) {
      await stopAlertAudio();
      return;
    }
    if (!document.fullscreenElement) {
      await playAlertAudio();
      const evt: ViolationEvent = {
        type: "fullscreen_exit",
        timestamp: new Date().toISOString(),
      };
      setViolations((prev) => [...prev, evt]);
      setViolationCount((c) => c + 1);
      setViolationMessage("Fullscreen exited. This counts as a violation.");
      setIsFullScreenVoilated(true)
    } else {
      await stopAlertAudio();
    }
  }, [quiz, isActive, playAlertAudio, stopAlertAudio]);

  useEffect(() => {
    if (!isActive || !quiz) return;

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    console.log("Event listeners added by fullScreen");
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      console.log("Event listeners removed by fullScreen");
    };
  }, [isActive, quiz, handleFullscreenChange]);

  useEffect(() => {
    if (!quiz) return;
    if (violationCount > quiz.settings.maxTabSwitches) {
      setViolationMessage("Maximum violations exceeded. Your quiz will be terminated.");
      handleSubmit("terminated");
    }
  }, [violationCount, quiz]);


  const makeFullScreen=async()=>{
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } 
  }
 
  const startQuiz = async () => {
    if (!quiz) return;
    try {
      await makeFullScreen()
    } catch {
      // ignore fullscreen errors
    }
    setIsActive(true);
  };

  const handleChangeAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (status: "completed" | "terminated") => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }

    const regKey = `qp_reg_${quizLink}`;
    const stored = localStorage.getItem(regKey);
    const studentFormData = stored ? JSON.parse(stored) : {};

    const payload = {
      studentFormData,
      answers: quiz.questions.map((q) => ({
        questionId: q._id,
        selectedAnswer: answers[q._id] || "",
      })),
      status,
      timeTaken:
        quiz.settings.timeLimitMinutes * 60 - (secondsLeft !== null ? secondsLeft : 0),
      violations,
    };

    try {
      const res = await api.post(`/quiz/${quizLink}/submit`, payload);
      localStorage.setItem(`qp_attempt_${quizLink}`, "1");
      navigate(`/quiz/${quizLink}/results`, {
        state: {
          submission: res.data,
          violationCount,
          timeTaken: payload.timeTaken,
        },
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Submission failed";
      navigate(`/quiz/${quizLink}/results`, {
        state: {
          error: msg,
          violationCount,
          timeTaken: payload.timeTaken,
        },
      });
    }
  };

  if (!quiz || secondsLeft === null) {
    return <p>Loading quiz...</p>;
  }

  const currentQuestion = quiz.questions[currentIndex];

  return (
    <div className="card" style={{ maxWidth: 800, margin: "20px auto" }}>
    <button 
    className={`${(isFullScreenVoilated && isActive)?"flex":"hidden"}`}
    onClick={async()=>{
      if(violationMessage?.includes("Fullscreen")){
        setIsFullScreenVoilated(false)
        await makeFullScreen()
      }
    }}>Full Screen</button>
      <h1>{quiz.title}</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>Time left: {secondsLeft}s</div>
        <div>
          Violations: {violationCount} / {quiz.settings.maxTabSwitches}
        </div>
      </div>
      {violationMessage && (
        <p className="text-danger" style={{ marginTop: 8 }}>
          {violationMessage}
        </p>
      )}
      {!isActive ? (
        <div style={{ marginTop: 16 }}>
          <p>
            When you click Start, the quiz will enter fullscreen mode and anti-cheating
            monitoring will begin.
          </p>
          <button onClick={startQuiz}>Start Quiz</button>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <h2>
            Question {currentIndex + 1} of {quiz.questions.length}
          </h2>
          <p>{currentQuestion.questionText}</p>
          {currentQuestion.questionType === "mcq" && (
            <div>
              {(currentQuestion.options || []).map((opt) => (
                <label key={opt} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={currentQuestion._id}
                    value={opt}
                    checked={answers[currentQuestion._id] === opt}
                    onChange={(e) => handleChangeAnswer(currentQuestion._id, e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {currentQuestion.questionType === "truefalse" && (
            <div>
              {["true", "false"].map((opt) => (
                <label key={opt} style={{ display: "block" }}>
                  <input
                    type="radio"
                    name={currentQuestion._id}
                    value={opt}
                    checked={answers[currentQuestion._id] === opt}
                    onChange={(e) => handleChangeAnswer(currentQuestion._id, e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {currentQuestion.questionType === "short" && (
            <textarea
              value={answers[currentQuestion._id] || ""}
              onChange={(e) => handleChangeAnswer(currentQuestion._id, e.target.value)}
            />
          )}

          <div style={{ marginTop: 16 }}>
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentIndex === quiz.questions.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
              style={{ marginLeft: 8 }}
            >
              Next
            </button>
          </div>

          <div style={{ marginTop: 16 }}>
            <button disabled={submitting} onClick={() => handleSubmit("completed")}>
              Submit Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizInterface;
