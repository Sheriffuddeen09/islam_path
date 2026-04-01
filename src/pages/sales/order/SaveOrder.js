import React, { useEffect, useState } from "react";
import api from "../../../Api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../layout/AuthProvider";

export default function SaveOrder() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {user} = useAuth()

  const navigate = useNavigate();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🔥 FETCH DRAFTS
  const fetchDrafts = async () => {
  setLoading(true);
  try {
    const res = await api.get(`/api/product/drafts/${user?.id}`);
    setDrafts(res.data);
  } catch {
    showToast("Failed to load drafts", "error");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDrafts();
  }, []);

  // 🔥 DELETE DRAFT
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
    <div className="p-6 lg:ml-64">

      {/* 🔔 TOAST */}
      {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
          {toast.msg}
        </div>
      )}

      <h2 className="text-xl text-black font-bold mb-5 border-b-2 border-blue-800 pb-2">
        Saved Products
      </h2>

      {/* 🔄 SKELETON */}
      {loading && (
        <div className="grid md:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <>
            <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse h-40"/>
            <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse h-16"/>
            <div key={i} className="bg-white p-4 rounded-xl shadow animate-pulse h-6"/>
            </>
          ))}
        </div>
      )}

      {/* 📦 DRAFT LIST */}
      {!loading && (
        <div className="grid md:grid-cols-3 gap-5">

          {drafts.map((draft) => {
            const data = draft.data;

            return (
              <div key={draft.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">

                <img
                  src={data?.image || "/placeholder.png"}
                  className="h-32 w-full object-cover rounded"
                />

                <h3 className="font-semibold mt-2">
                  {data?.title || "Untitled"}
                </h3>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {data?.description || "No description"}
                </p>

                <div className="flex justify-between mt-3 gap-2">

                  {/* CONTINUE */}
                  <button
                    onClick={() =>
                      navigate("/checkout", { state: data })
                    }
                    className="flex-1 bg-blue-600 text-white py-1 rounded text-sm"
                  >
                    Continue
                  </button>

                  {/* ORDER */}
                  <button
                    onClick={async () => {
                      await api.post("/api/order/create", data);
                      showToast("Order placed!");
                    }}
                    className="flex-1 bg-green-600 text-white py-1 rounded text-sm"
                  >
                    Order
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => setDeleteId(draft.id)}
                    className="flex-1 bg-red-500 text-white py-1 rounded text-sm"
                  >
                    Delete
                  </button>

                </div>
              </div>
            );
          })}

          {drafts.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-10">
              No saved products
            </div>
          )}
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-[350px] text-center">

            <h3 className="font-bold text-lg mb-3">
              Delete Draft?
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">

              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className={`flex-1 py-2 rounded text-white
                  ${deleting ? "bg-gray-400" : "bg-red-600"}
                `}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}