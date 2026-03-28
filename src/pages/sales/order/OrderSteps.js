import React, { useState, useEffect } from "react";
import axios from "axios";
import SuccessModal from "./SuccessModal";

export default function OrderStep({ form, setForm, orderData, setStep }) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [showAd, setShowAd] = useState(false);
  const [adFinished, setAdFinished] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [success, setSuccess] = useState({
  show: false,
  type: "order",
  message: ""
});

  // 🔥 SWITCH MODE HERE
  const USE_REAL_ADS = false; // 👉 change to true later

  // 🔥 FAKE ADS (TEST)
  const ads = [
    "https://via.placeholder.com/400x200?text=Ad+1",
    "https://via.placeholder.com/400x200?text=Ad+2",
    "https://via.placeholder.com/400x200?text=Ad+3"
  ];
  const [currentAd, setCurrentAd] = useState(0);

  const showNotify = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
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

  // =========================
  // 🔥 OPEN AD
  // =========================
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
    setShowAd(false);
    setLoading(true);

    try {
      if (form.payment_method === "save") {
        await axios.post("/api/product/save-draft", {
          ...orderData,
          status: "draft",
        });

        setSuccess({
          show: true,
          type: "save",
          message: "Your product has been saved as draft."
        });
      }

      if (form.payment_method === "order") {
        await axios.post("/api/order/create", {
          ...orderData,
          status: "pending",
        });

       setSuccess({
          show: true,
          type: "order",
          message: "Your order has been sent to the seller!"
        });
      }

    } catch (err) {
      console.error(err);
      showNotify("error", "Action failed");
    } finally {
      setLoading(false);
      setAdFinished(false);
    }
  };

  return (
    <>
      {/* 🔔 NOTIFICATION */}
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
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
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
              className={`cursor-pointer p-6 rounded-2xl border transition ${
                form.payment_method === opt.id
                  ? "border-blue-600 scale-105 shadow-xl"
                  : "hover:shadow-lg"
              }`}
            >
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
            disabled={loading}
            className={`flex-1 py-3 rounded-xl text-white flex justify-center items-center
              ${loading ? "bg-gray-400" : "bg-blue-600"}
            `}
          >
            {loading ? "Processing..." : "Continue →"}
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
              <h2 className="font-bold">Sponsored Ad</h2>

              {!adFinished && (
                <p className="text-sm text-gray-500">
                  Skip in {countdown}s...
                </p>
              )}

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