import React, { useEffect, useState } from "react";
import api from "../../../Api/axios";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  // ✅ SHOW TOAST
  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // ✅ FETCH ORDERS
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/orders");
      setOrders(res.data);
    } catch (err) {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ DELETE ORDER WITH LOADING + TOAST
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    setDeletingId(id);

    try {
      await api.delete(`/api/order/${id}`);

      setOrders((prev) => prev.filter((o) => o.id !== id));

      showToast("Order deleted successfully");
    } catch (err) {
      showToast("Failed to delete order", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="relative">
      
      {/* 🔔 TOAST */}
      {toast && (
        <div
          className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white transition ${
            toast.type === "error" ? "bg-red-500" : "bg-green-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* 🔄 LOADING SKELETON */}
      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 p-5 rounded-2xl h-40"
            />
          ))}
        </div>
      )}

      {/* 📦 ORDERS */}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Order #{order.id}</h3>

                <button
                  onClick={() => handleDelete(order.id)}
                  disabled={deletingId === order.id}
                  className={`text-sm px-3 py-1 rounded transition ${
                    deletingId === order.id
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "text-red-500 hover:bg-red-50"
                  }`}
                >
                  {deletingId === order.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              <p className="text-sm text-gray-500">
                {order.first_name} {order.last_name}
              </p>

              <p className="text-sm text-gray-500 mb-2">
                {order.address}
              </p>

              {/* ITEMS */}
              <div className="border-t pt-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span>
                      ₦{item.price} × {item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* TOTAL */}
              <div className="flex justify-between mt-3 font-semibold">
                <span>Total</span>
                <span>₦{order.total_price}</span>
              </div>
            </div>
          ))}

          {/* EMPTY STATE */}
          {orders.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-10">
              No orders yet
            </div>
          )}
        </div>
      )}
    </div>
  );
}