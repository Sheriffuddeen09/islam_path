import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function AdminChoice() {
  const [selected, setSelected] = useState("");
  const [choice, setChoice] = useState("");   // ✅ backend value
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // =============================
  //      CHECK LOGIN STATUS
  // =============================
  useEffect(() => {
    const checkLogin = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");

        const res = await api.get("/api/user");
        const statusRes = await api.get("/api/user-status");

        if (res.data) {
          setCurrentUser(res.data);
        }
      } catch (err) {
        navigate("/login");
      }
    };

    checkLogin();
  }, [navigate]);

  const options = [
    {
      id: "sell",
      title: "Sell Your Courses",
      emoji: "💼",
      bg: "bg-green-100",
      text: "text-green-600",
      hoverBg: "group-hover:bg-green-600",
    },
    {
      id: "free",
      title: "Create Free Content",
      emoji: "🎁",
      bg: "bg-blue-100",
      text: "text-blue-600",
      hoverBg: "group-hover:bg-blue-600",
    },
    {
      id: "teacher",
      title: "Become an Arabic Teacher",
      emoji: "📚",
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      hoverBg: "group-hover:bg-yellow-600",
    },
  ];

  // =============================
  //       SUBMIT CHOICE
  // =============================
  const handleSubmit = async () => {
    if (!choice) return;

    setIsLoading(true);
    try {
      const res = await api.post("/api/admin/choose-choice", { choice });

      navigate(res.data.redirect);
    } catch (err) {
      console.log("Error submitting choice:", err.response?.data || err);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Checking authentication...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl p-10">
        <h1 className="sm:text-3xl text-lg font-bold text-gray-900 text-center mb-6">
          Choose How You Want to Contribute
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Select an option to begin setting up your admin journey.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                setSelected(opt.id);
                setChoice(opt.id);
              }}
              className={`p-6 rounded-xl border cursor-pointer transition-all duration-300 ${
                selected === opt.id
                  ? "shadow-2xl scale-105 border-purple-500"
                  : "border-gray-200 hover:shadow-xl hover:-translate-y-2"
              } group bg-white`}
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full mb-4 text-3xl ${opt.bg} ${opt.text} transition-all ${opt.hoverBg} group-hover:text-white`}
                >
                  {opt.emoji}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {opt.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {opt.id === "sell" &&
                    "Create premium courses and earn income while teaching others."}
                  {opt.id === "free" &&
                    "Share free lessons, articles, and videos to benefit the community."}
                  {opt.id === "teacher" &&
                    "Teach Arabic to students worldwide and inspire learners every day."}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={handleSubmit}   // ✅ Save choice
            disabled={!choice || isLoading}
            className={`px-8 py-3 rounded-full font-semibold text-lg shadow-md transition-all ${
              choice
                ? "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </section>
  );
}
