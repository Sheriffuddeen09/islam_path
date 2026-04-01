import React, { useState, useEffect } from "react";
import api from "../../../Api/axios";
import SuccessModal from "./SuccessModal";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../../layout/AuthProvider";
import { v4 as uuidv4 } from "uuid";

export default function OrderSteps({ form, setForm, orderData, setStep, setSavedCount }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [showAd, setShowAd] = useState(false);
  const [adFinished, setAdFinished] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [success, setSuccess] = useState({
  show: false,
  type: "order",
  message: ""
});

  const USE_REAL_ADS = false; // 👉 change to true later

  const ads = [
    "https://via.placeholder.com/400x200?text=Ad+1",
    "https://via.placeholder.com/400x200?text=Ad+2",
    "https://via.placeholder.com/400x200?text=Ad+3"
  ];
  const [currentAd, setCurrentAd] = useState(0);

  const {user} = useAuth()

  const showNotify = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const paymentOptions = [
    {
      id: "order",
      title: "Order Product",
      desc: "Send order to seller and start processing.",
      emoji: "🛒",
      color: "from-yellow-400 to-yellow-600",
    },
    {
      id: "save",
      title: "Save for Later",
      desc: "Save and continue anytime.",
      emoji: "💾",
      color: "from-green-400 to-green-600",
    }
  ];

 
  const handleCheckout = () => {
    if (!form.payment_method) {
      showNotify("error", "Please select an option");
      return;
    }

    // 🔥 REAL ADS TRIGGER
    if (USE_REAL_ADS && window.showAdNetwork) {
      window.showAdNetwork(); // external ad script
    }

    setShowAd(true);
    setAdFinished(false);
  };

  // =========================
  // 🔥 COUNTDOWN
  // =========================
  useEffect(() => {
    if (!showAd) return;

    setCountdown(5);
    setCurrentAd(Math.floor(Math.random() * ads.length));

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showAd]);

  // =========================
  // 🔥 AFTER AD
  // =========================
  const handleAfterAd = async () => {

  if (loading) return;
  setShowAd(false);
  setLoading(true);

  try {
    if (form.payment_method === "save") {

      const res = await api.post("/api/product/save-draft", {
        ...orderData,
        user_id: user?.id,
        status: "draft",
      });

      if (res.data.success) {
        setSavedCount((prev) => prev + 1);

        setSuccess({
          show: true,
          type: "save",
          message: res.data.message || "Saved successfully",
        });
      }
    }

    if (form.payment_method === "order") {

      const order_token = Date.now() + "-" + user?.id;

      const res = await api.post("/api/order/create", {
        ...orderData,
         order_token,
        status: "pending",
      });

      if (res.data.success) {
        setSuccess({
          show: true,
          type: "order",
          message: res.data.message || "Order sent!",
        });
      }
    }

  } catch (err) {
    console.log(err);

    // 🔥 HANDLE API ERROR MESSAGE
    if (err.response) {
      const message = err.response.data.message;

      showNotify("error", message || "Something went wrong");
    } else {
      showNotify("error", "Network error");
    }

  } finally {
    setLoading(false);
    setAdFinished(false);
  }
};


  return (
    <>
      {/* 🔔 NOTIFICATION */}
      {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          {toast.message}
        </div>
      )}

      
     {success.show && (
        <SuccessModal
          type={success.type}
          message={success.message}
          onClose={() =>
            setSuccess({ show: false, type: "", message: "" })
          }
        />
      )}

      {/* MAIN UI */}
      <div className="max-w-5xl mx-auto text-black bg-white p-8 z-50 rounded-3xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">
          Choose Action
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {paymentOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() =>
                setForm({ ...form, payment_method: opt.id })
              }
              className={`cursor-pointer relative p-6 rounded-2xl border transition ${
                form.payment_method === opt.id
                  ? "border-blue-600 scale-105 shadow-xl"
                  : "hover:shadow-lg"
              }`}
            >
              <CheckCircle className={`absolute top-5 right-4 text-blue-800 ${form.payment_method === opt.id ? "block" : "hidden"}`} />
              <div className={`h-16 w-16 flex items-center justify-center text-white text-2xl rounded-full bg-gradient-to-r ${opt.color}`}>
                {opt.emoji}
              </div>

              <h3 className="mt-4 text-lg font-semibold">{opt.title}</h3>
              <p className="text-sm text-gray-500">{opt.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6 gap-3">
          <button
            onClick={() => setStep(2)}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Back
          </button>

          <button
            onClick={handleCheckout}
            className={`flex-1 py-3 rounded-xl text-white flex justify-center items-center
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"}
            `}
          >
            {loading ? <p className="inline-flex items-center sm:gap-4 gap-1 "><svg
      className="animate-spin h-5 w-5 text-white"
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
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg> Processing</p> : "Continue →"}
          </button>
        </div>
      </div>

      {/* ================= AD MODAL ================= */}
      {showAd && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50">

          <div className="bg-white w-[420px] rounded-xl overflow-hidden">

            {/* 🔥 FAKE AD */}
            {!USE_REAL_ADS && (
              <>
                <img
                  src={ads[currentAd]}
                  className="w-full h-52 object-cover"
                  alt="Ad"
                />
              </>
            )}

            {/* 🔥 REAL AD SLOT */}
            {USE_REAL_ADS && (
              <div className="p-6 text-center">
                <p>Real Ad Loading...</p>
                {/* AdSense / Ad script goes here */}
              </div>
            )}

            <div className="p-4 text-center space-y-3">
              <div className="flex justify-center gap-3">
                {adFinished && (
                  <button
                    onClick={handleAfterAd}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Continue
                  </button>
                )}

                {!adFinished && (
                  <button
                    onClick={handleAfterAd}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}