import React, { useEffect, useState } from "react";
import api from "../../../Api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../layout/AuthProvider";

export default function SaveOrder() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [orderingId, setOrderingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);


  const symbols = { USD: "$", NGN: "₦", EUR: "€", GBP: "£" };


  const { user } = useAuth() || {};
  const navigate = useNavigate();

  // ================= TOAST =================
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ================= FETCH =================
  const fetchDrafts = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await api.get(`/api/product/drafts/${user.id}`);
      setDrafts(res.data || []);
    } catch {
      showToast("Failed to load drafts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [user]);

  // ================= DELETE =================
  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await api.delete(`/api/product/draft/${deleteId}`);
      setDrafts((prev) => prev.filter((d) => d.id !== deleteId));
      showToast("Draft deleted");
      setDeleteId(null);
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
  <div className="p-3 sm:p-4 md:p-6 lg:ml-64">

    {/* ================= TOAST ================= */}
    {toast && (
      <div
        className={`fixed top-3 right-3 sm:top-5 sm:right-5 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-xl text-white z-50 shadow-lg
        ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}
      >
        {toast.msg}
      </div>
    )}

    {/* ================= HEADER ================= */}
    <h2 className="text-lg sm:text-xl text-black font-bold mb-4 sm:mb-5 border-b-2 border-blue-800 pb-2">
      Saved Orders
    </h2>

    {/* ================= LOADING ================= */}
    {loading && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-3 sm:p-4 rounded-xl shadow animate-pulse">
            <div className="flex gap-2 sm:gap-3 overflow-hidden">
              {[1,2,3].map((j) => (
                <div key={j} className="min-w-[90px] sm:min-w-[120px] h-20 sm:h-24 bg-gray-200 rounded" />
              ))}
            </div>
            <div className="h-3 sm:h-4 bg-gray-200 mt-3 rounded w-1/2"></div>
            <div className="flex gap-2 mt-3">
              <div className="h-7 sm:h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-7 sm:h-8 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* ================= DATA ================= */}
    {!loading && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">

        {drafts.map((draft) => {
          const data = draft.data;

          const totalItems = data?.items?.length || 0;
          const totalPrice = data?.total_price || 0;

          return (
            <div
              key={draft.id}
              className="bg-white p-3 sm:p-4 rounded-xl shadow hover:shadow-lg transition"
            >

              {/* ===== PRODUCTS ROW ===== */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">

                {data?.items?.map((item, index) => (
                  <div
                    key={index}
                    className="min-w-[140px] sm:min-w-[180px] bg-gray-50 rounded-lg p-2 shadow-sm"
                  >
                    <img
                      src={item.image || "/placeholder.png"}
                      className="h-20 sm:h-24 w-full object-cover rounded"
                    />

                    <h3 className="text-xs sm:text-sm font-semibold mt-1 line-clamp-1">
                      {item.name}
                    </h3>

                    <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2">
                      {item.description}
                    </p>

                    <p className="text-xs sm:text-sm font-bold mt-1">
                      ₦{item.price}
                    </p>
                  </div>
                ))}

              </div>

              {/* ===== SUMMARY ===== */}
              <div className="flex justify-between items-center mt-3 text-xs sm:text-sm text-gray-600">
                <span>{totalItems} item(s)</span>
                <span className="font-bold text-black">
                  ₦{totalPrice}
                </span>
              </div>

              {/* ===== ACTIONS ===== */}
              <div className="flex flex-row gap-2 mt-3">

                <button
                onClick={async () => {
                  try {
                    setOrderingId(draft.id);

                    const payload = {
                    ...data,
                    order_token: data?.order_token || `${Date.now()}_${user?.id}`,

                    user_id: user?.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,

                    // ✅ FIX HERE
                    address: data.address || "No address",
                    city: data.city || "No city",
                    state: data.state || "No state",
                    zip: data.zip || "0000",

                    payment_method: "save",
                  };

                    await api.post("/api/order/create", payload);

                    // ✅ DELETE DRAFT AFTER ORDER
                    await api.delete(`/api/product/draft/${draft.id}`);

                    // ✅ REMOVE FROM UI
                    setDrafts((prev) => prev.filter((d) => d.id !== draft.id));

                    showToast("Order placed successfully!");
                  } catch (err) {
                    console.error(err);
                    showToast(
                      err?.response?.data?.message || "Order failed",
                      "error"
                    );
                  } finally {
                    setOrderingId(null);
                  }
                }}
                disabled={orderingId === draft.id}
                className={`w-full sm:flex-1 py-2 rounded text-xs sm:text-sm text-white transition flex items-center justify-center
                  ${
                    orderingId === draft.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {orderingId === draft.id ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="white"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Ordering...
                  </span>
                ) : (
                  "Order"
                )}
              </button>

                <button
                  onClick={() => setDeleteId(draft.id)}
                  className="w-full sm:flex-1 bg-red-500 text-white py-2 rounded text-xs sm:text-sm hover:bg-red-600"
                >
                  Delete
                </button>

              </div>
            </div>
          );
        })}

        {/* EMPTY STATE */}
        {drafts.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-10 text-sm">
            No saved orders
          </div>
        )}
      </div>
    )}

    {/* ================= DELETE MODAL ================= */}
    {deleteId && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">

        <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-sm text-center shadow-lg">

          <h3 className="font-bold text-base sm:text-lg mb-3">
            Delete Draft?
          </h3>

          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            This action cannot be undone.
          </p>

          <div className="flex gap-2 sm:gap-3">

            <button
              onClick={() => setDeleteId(null)}
              className="flex-1 bg-gray-200 py-2 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              onClick={confirmDelete}
              disabled={deleting}
              className={`flex-1 py-2 rounded text-white text-sm
                ${deleting ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}
              `}
            >
              {deleting ? <p className="inline-flex gap-2 items-center">
                 <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="white"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Deleting
              </p>  : "Delete"}
            </button>

          </div>
        </div>
      </div>
    )}

  </div>
);
}