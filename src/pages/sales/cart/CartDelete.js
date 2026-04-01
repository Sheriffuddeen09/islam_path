import React, { useState } from "react";
import { Trash2, X, Loader2 } from "lucide-react";
import api from "../../../Api/axios";
import Toast from "../../../notification/Toast";

const CartDelete = ({ cartId, handleRemoveItem }) => {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ loading state

  const handleDelete = async () => {
    try {
      setLoading(true); 
      const response = await api.delete(`/api/cart/${cartId}`);

      handleRemoveItem(response.data);
      setShowModal(false);

      // ✅ show toast
      setShowToast(true);

      // auto hide after 3s
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Failed to delete item:", error.message);
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={() => setShowModal(true)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        <Trash2 className="w-5 h-5 text-black" />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white w-[90%] max-w-sm rounded-xl p-6 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h3 className="text-lg font-bold text-center mb-4">
              Delete Cart Item
            </h3>

            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this item?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-gray-200 rounded-lg"
                disabled={loading} // disable while loading
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="w-full py-2 bg-red-600 text-white rounded-lg flex items-center justify-center gap-2"
                disabled={loading} // disable while loading
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Toast */}
      <Toast message="Item removed from cart 🛒" show={showToast} />
    </>
  );
};

export default CartDelete;