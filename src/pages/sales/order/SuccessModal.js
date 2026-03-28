import React from "react";
import { CheckCircle, ShoppingCart, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SuccessModal({
  onClose,
  type = "order", // order | save | payment
  message = "Action completed successfully!",
}) {
  const navigate = useNavigate();

  const config = {
    order: {
      title: "Order Successful 🎉",
      icon: <ShoppingCart className="text-green-600 w-10 h-10" />,
      primaryBtn: "View Orders",
      primaryRoute: "/orders",
      secondaryBtn: "Continue Shopping",
      secondaryRoute: "/online-sale",
    },
    save: {
      title: "Saved Successfully 💾",
      icon: <Save className="text-blue-600 w-10 h-10" />,
      primaryBtn: "View Drafts",
      primaryRoute: "/drafts",
      secondaryBtn: "Continue Editing",
      secondaryRoute: "/dashboard",
    }
  };

  const current = config[type] || config.order;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fadeIn">

      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full animate-bounce">
            {current.icon}
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {current.title}
        </h2>

        {/* MESSAGE */}
        <p className="text-gray-500 mb-6">
          {message}
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">

          <button
            onClick={() => navigate(current.primaryRoute)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            {current.primaryBtn}
          </button>

          <button
            onClick={() => navigate(current.secondaryRoute)}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            {current.secondaryBtn}
          </button>

        </div>
      </div>
    </div>
  );
}