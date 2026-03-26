import React, { useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import api from "../../../Api/axios";
import Toast from "./Toast";

const WishlistDelete = ({ wishlistId, handleRemoveItem }) => {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await api.delete(`/api/wishlist/${wishlistId}`);
      handleRemoveItem(response.data);
      setShowModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className="p-1 hover:bg-gray-100 rounded">
        <Trash2 className="w-5 h-5 text-black" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="bg-white w-[90%] max-w-sm rounded-xl p-6 shadow-lg relative">
            <button onClick={() => setShowModal(false)} className="absolute top-3 right-3">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h3 className="text-lg font-bold text-center mb-4">Remove Wishlist Item</h3>
            <p className="text-gray-600 text-center mb-6">Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="w-full py-2 bg-gray-200 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-2 bg-red-600 text-white rounded-lg"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      <Toast message="Item removed from wishlist 🛒" show={showToast} />
    </>
  );
};

export default WishlistDelete;