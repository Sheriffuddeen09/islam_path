import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/axios";
import useExamTimer from "./useExamTimer";
import toast, { Toaster } from "react-hot-toast";


export default function StudentExam() {
  /* ------------------ STATE ------------------ */
   const { token } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState({ questions: [ ] });
  const [status, setStatus] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [showResume, setShowResume] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [rescheduleCount, setRescheduleCount] = useState(0);
  const [restartLocked, setRestartLocked] = useState(false);
  const [started, setStarted] = useState(false);

  const timeInitialized = useRef(false);
  const initialTime = useRef(null);

 const enterFullscreen = async () => {
  try {
    await document.documentElement.requestFullscreen();
  } catch (err) {
    console.error("Fullscreen failed:", err);
  }
};


useEffect(() => {
  if (status === "in_progress") {
    enterFullscreen();
  }
}, [status]);


useEffect(() => {
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && status === "in_progress") {
      toast.error("Fullscreen Exit");
      enterFullscreen();
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  return () =>
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
}, [status]);

const totalQuestions = exam?.questions?.length || 0;
const answeredCount = Object.keys(answers).length;
const progressPercent =
  totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;


  /* ------------------ SUBMIT ------------------ */
 const submittingRef = useRef(false);
const [submitting, setSubmitting] = useState(false);

const submit = async (source = "manual") => {
  // ✅ Remove this — it blocks submission
  // if (!started) return;

  console.log('submit click')
  if (submittingRef.current) return;

  submittingRef.current = true;
  setSubmitting(true);

  try {
    await api.post(`/api/student/exam/${token}/submit`, {
      answers,
      source,
    });

    toast.success("Exam submitted");
    navigate("/student/dashboard");
  } catch (err) {
    // toast.error(err.response?.data?.message || "Submission failed");
    submittingRef.current = false; // allow retry
  } finally {
    setSubmitting(false);
  }
};


  /* ------------------ TIMER ------------------ */
  const { timeLeft, setTimeLeft } = useExamTimer(
  started ? exam.duration_minutes * 60 : null,
  submit
);

  useEffect(() => {
  if (!exam || initialTime.current !== null) return;

  if (status === "new") {
    initialTime.current = exam.duration_minutes * 60;
  }

  if (status === "in_progress" && resumeData) {
    initialTime.current = resumeData.remaining_seconds;
  }

  setTimeLeft(initialTime.current);
}, [exam, status, resumeData, setTimeLeft]);



  /* ------------------ LOAD Exam ------------------ */
  useEffect(() => {
    if (!token) return;

    api
      .get(`/api/student/exams/${token}`)
      .then(res => {
        const data = res.data;

        setStatus(data.status);
        setExam(data.exam);

        setLocked(data.locked ?? false);
        setRescheduleCount(data.reschedule_count ?? 0);

        
        if (data.status === "expired_not_started") {
          toast.error("Exam has been expired");
          navigate("/expire");
          return;
        }

        if (data.status === "submitted") {
          toast.error("Already submitted");
          navigate("/student/dashboard");
          return;
        }
        

        if (data.status === "in_progress") {
          setResumeData(data);
          setShowResume(true);
        }
      })
      .catch(err => {
            if (err.response?.status === 403) {
              navigate("/block");
            } else {
              toast.error("Assignment not found");
              navigate("/expire");
            }
          })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  /* ------------------ INIT TIMER ONCE ------------------ */
  useEffect(() => {
    if (!exam || timeInitialized.current) return;

    if (status === "new") {
      setTimeLeft(exam.duration_minutes * 60);
    }

    if (status === "in_progress" && resumeData) {
      setAnswers(resumeData.answers || {});
      setCurrentIndex(resumeData.current_index || 0);
      setTimeLeft(resumeData.remaining_seconds);

      // 🔒 Disable restart after resume
      setRestartLocked(true);
    }

    timeInitialized.current = true;
  }, [exam, status, resumeData, setTimeLeft]);

  useEffect(() => {
  if (status !== "in_progress") return;

  const interval = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(interval);
        submit(); // auto submit
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [status]);


  /* ------------------ AUTO SUBMIT ------------------ */
  useEffect(() => {
  if (!started) return;
  if (timeLeft <= 0) submit("timer");
}, [timeLeft, started]);


  /* ------------------ AUTO SAVE check ------------------ */
 const [saving, setSaving] = useState(false);
 const [navLoading, setNavLoading] = useState(null);

const saveProgress = async () => {
  if (!exam || saving) return;

  setSaving(true);
  try {
    await api.post("/api/exams/save-progress", {
      exam_id: exam.id,
      answers,
      current_index: currentIndex,
      remaining_seconds: timeLeft,
    });
  } catch (err) {
    console.error("Failed to save progress:", err.response?.data || err);
  } finally {
    setSaving(false);
  }
};


useEffect(() => {
  if (!exam) return;

  const interval = setInterval(() => {
    saveProgress();
  }, 15000); // every 15s

  return () => clearInterval(interval);
}, [exam, answers, currentIndex, timeLeft]);

const goNext = async () => {
  if (navLoading) return;

  if (!answers[currentQuestion.id]) {
    toast.error("Please select an answer before continuing!");
    return;
  }

  setNavLoading("next");
  try {
    await saveProgress();
    setCurrentIndex(i => i + 1);
  } finally {
    setNavLoading(null);
  }
};

const goPrev = async () => {
  if (navLoading) return;

  setNavLoading("prev");
  try {
    await saveProgress();
    setCurrentIndex(i => i - 1);
  } finally {
    setNavLoading(null);
  }
};

const Spinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-white mx-auto"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);



  /* ------------------ START ------------------ */
  const [starting, setStarting] = useState(false);

  const startExam = async () => {
    setStarting(true);
  try {
    await api.post(`/api/student/exams/${token}/start`);

    setStarted(true);
    setStatus("in_progress");
    setTimeLeft(exam.duration_minutes * 60);
    setRestartLocked(false);

    toast.success("Exam started");
  } catch {
    toast.error("Unable to start exam");
  }
  finally {
    setStarting(false);
  }
};


  /* ------------------ RESUME ------------------ */
  const [resuming, setResuming] = useState(false);
  const [startedAt, setStartedAt] = useState(null);

  const resumeExam = async () => {
    setResuming(true);
  try {
    const res = await api.get(`/api/student/exams/${token}/resume`);

    setAnswers(res.data.answers || {});
    setCurrentIndex(res.data.current_index || 0);
    setStartedAt(res.data.started_at);
    setTimeLeft(res.data.remaining_seconds || exam.duration_minutes * 60);

    setStatus("in_progress"); // important!
    setShowResume(false);
    setRestartLocked(true);
  } catch {
    toast.error("Unable to resume exam");
  }
  finally{
    setResuming(false);
  }
};

  /* ------------------ RESTART ------------------ */

  const [restarting, setRestarting] = useState(false);

  const restartExam = async () => {
    if (restartLocked) return;

    setRestarting(true);

    try {
    await api.post(`/api/student/exams/${token}/restart`, {
      Exam_id: exam.id,
    });

    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(exam.duration_minutes * 60);
    setRestartLocked(true);
    setShowResume(false);

    toast.success("Exam restarted");
  }
   catch (err) {
    toast.error(err.response?.data?.message || "Restart failed");
  }
  finally {
    setRestarting(false);
  }
};

  /* ------------------ EXTEND ------------------ */

  const [showReschedule, setShowReschedule] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [loadingReschedule, setLoadingReschedule] = useState(false);


const extend = async () => {
  if (!newDate) return;

  setLoadingReschedule(true);

  try {
    const res = await api.post("/api/student/exams/reschedule", {
      exam_id: exam.id,
      new_due_at: newDate,
    });

    toast.success("Exam rescheduled");

    setLocked(true);
    setShowReschedule(false);

    setExam(prev => ({
      ...prev,
      due_at: res.data.new_due_at,
      extended: true,
    }));
  } catch (err) {
    toast.error(
      err.response?.data?.message || "Reschedule failed"
    );
  } finally {
    setLoadingReschedule(false);
  }
};



const handleStart = async () => {
  await enterFullscreen();
  await startExam();
};


  /* ------------------ UI GUARD ------------------ */
  if (loading || !exam) return null;

  if (loading)
    return (
      <div className="text-black flex items-center justify-center h-">
        <div className="text-black animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );


  const currentQuestion = exam.questions[currentIndex];


  const disableRestartAfter =
    resumeData &&
    Date.now() - new Date(resumeData.created_at).getTime() > 5 * 60 * 1000;

  const restartDisabled = restartLocked || disableRestartAfter;

  /* ------------------ RENDER ------------------ */

  
 return (
  <div className="min-h-screen bg-gray-100">
    <Toaster position="top-right" />

    {/* ================= TOP NAV ================= */}
    <div className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="sm:text-lg font-semibold text-sm font-semibold text-gray-800">
          ISLAM PATH OF KNOWLEDGE
        </h1>

        <button
          onClick={() => navigate("/student/dashboard")}
          className="px-4 py-2 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          Dashboard
        </button>
      </div>
    </div>

    {/* ================= TIMER ================= */}
    {status === "in_progress" && (
      <div className="fixed top-16 mt-2 right-4 z-50 flex flex-row flex-wrap items-center gap-4">
      {status === "in_progress" && Number.isFinite(timeLeft) && (
      <div className="bg-black text-white px-4 py-2 rounded-full text-sm shadow-lg">
        ⏱ {Math.floor(timeLeft / 60)}:
        {(timeLeft % 60).toString().padStart(2, "0")}
      </div>
    )}


        <button
      onClick={enterFullscreen}
      className="btn-primary text-sm rounded-lg px-4 py-2"
    >
      Fullscreen
    </button>

      {exam.extended && (
        <p className="text-sm text-orange-600 mt-2">
          Deadline rescheduled {" "}
          {new Date(exam.due_at).toLocaleDateString()}
        </p>
      )}

      </div>


    )}

    {/* ================= MAIN CONTENT ================= */}
    <div className="max-w-5xl mt-10 mx-auto p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-md p-5 md:p-6">

        {/* ================= STARTED AT ================= */}
        {startedAt && status === "in_progress" && (
            <p className="text-sm text-gray-500 mb-2">
              Started at: {new Date(startedAt).toLocaleString()}
            </p>
          )}


        {/* ================= EXTENSION BADGE ================= */}
        {exam.extended && (
          <span className="inline-block mb-4 bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
            Extended ({rescheduleCount})
          </span>
        )}

        {/* ================= NEW Exam ================= */}
        {status === "new" && (
          <div className="space-y-4 mx-auto">
           <h1 className="text-lg font-semibold text-gray-800">
            Exam
          </h1>
            <p className="text-gray-800">
              <strong>Deadline:</strong>{" "}
              {new Date(exam.due_at).toLocaleString()}
            </p>

            <button
              onClick={handleStart}
              className="w-full md:w-auto px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              {starting ? (
                <svg
                  className="animate-spin h-5 w-5 text-white mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : (
                "Start Exam"
              )}
            </button>

                <button
                  onClick={() => setShowReschedule(prev => !prev)}
                  disabled={locked}
                  className="w-full md:w-auto px-6 py-3 sm:ml-3 font-semibold rounded-md border border-gray-300 text-gray-900 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Reschedule
                </button>

                {showReschedule && !locked && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="border px-3 py-2 rounded w-full sm:w-auto"
                />

                <button
                  onClick={extend}
                  disabled={!newDate || loadingReschedule}
                  className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  {loadingReschedule ? 
                  <svg
                    className="animate-spin h-5 w-5 text-gray-800 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                   : "Confirm"}
                </button>

                <button
                  onClick={() => {
                    setShowReschedule(false);
                    setNewDate("");
                  }}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
              </div>
            )}

            {locked && (
              <p className="text-sm text-red-600">
                Extension limit reached
              </p>
            )}
          </div>
        )}

        {/* ================= QUESTIONS ================= */}
        {showResume && (
      <div className="text-black fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="text-black bg-white p-6 rounded-lg w-80 text-black">
          <h2 className="text-black text-center font-semibold text-lg">
            Resume Exam?
          </h2>

          <div className="text-black flex justify-center gap-3 mt-4">
            <button
              disabled={restartLocked}
              onClick={restartExam}
              className={`btn bg-gray-900 rounded-lg px-3 py-2 text-white hover:bg-gray-800 ${
                restartLocked ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {restarting ? 
              <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg> 
              : "Restart"}
            </button>

            <button onClick={resumeExam} className="text-black btn-primary">
              {resuming ? 
              <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg> 
              : "Continue"}
            </button>
          </div>

          {restartDisabled && (
            <p className="text-black text-center text-xs text-red-500 mt-2">
              Restart disabled after 5 minutes or resume
            </p>
          )}
        </div>
      </div>
    )}

        {status === "in_progress" && (
          <>
            <div key={currentQuestion.id}
              className="transition-all duration-300 ease-in-out transform animate-question">
                <div className="w-full bg-gray-200 h-2 rounded overflow-hidden mb-4">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

              <h3 className="font-semibold text-gray-800">
               ANSWER {answeredCount} of {totalQuestions}
              </h3>

              <p className="mt-3 text-gray-700">
                {currentQuestion.question}
              </p>

              <div className="mt-4 space-y-3">
                {["A", "B", "C", "D"].map(opt => (
                  <label
                    key={opt}
                    className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      checked={answers[currentQuestion.id] === opt}
                      onChange={() =>
                        setAnswers(prev => ({
                          ...prev,
                          [currentQuestion.id]: opt,
                        }))
                      }
                    />
                    <span className="text-gray-700">
                      {currentQuestion[`option_${opt.toLowerCase()}`]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ================= NAVIGATION ================= */}
            <div className="flex justify-between mt-8">
              <button
              disabled={currentIndex === 0 || navLoading === "next"}
              onClick={goPrev}
              className="px-5 py-2 rounded-md border text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              {navLoading === "prev" ? (
                    <Spinner />
                  ) : (
                    "Previous"
                  )
                  }
            </button>


              {exam?.questions?.length > 0 && currentIndex === exam.questions.length - 1 ? (
                <button
                  type="button" onClick={() => submit("manual")}

                  disabled={submitting}
                  className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
                >
                  {submitting ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white mx-auto"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    "Submit"
                  )
                  }
                </button>
              ) : (
                <button
                onClick={goNext}
                disabled={navLoading === "prev"}
                className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {navLoading === "next" ? (
                <Spinner />
              ) : (
                "Next"
              )
              }
            </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </div>
);


}
