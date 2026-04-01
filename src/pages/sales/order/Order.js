import React, { useEffect, useState } from "react";
import api from "../../../Api/axios";
import { useAuth } from "../../../layout/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const { user } = useAuth();
  const authUserId = user?.id;

  const navigate = useNavigate()
 
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
  setLoading(true);
  try {
    const res = await api.get("/api/orders");

    const data = res.data?.orders || res.data || [];

    setOrders(Array.isArray(data) ? data : []);

  } catch (err) {
    showToast("Failed to load orders", "error");
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
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
  
  const handleMessageSeller = async (sellerId, orderId) => {
    try {
      await api.post("/api/chat/create", {
        seller_id: sellerId,
        order_id: orderId,
      });

      showToast("Chat opened with seller");
    } catch (err) {
      showToast("Failed to open chat", "error");
    }
  };
  const openChat = async (sellerId, orderId) => {
  try {
    const res = await api.post("/api/chat/create", {
      seller_id: sellerId,
      order_id: orderId,
    });

    // 🟡 ACCEPT CHAT ON OPEN
    await api.post(`/api/chat/${res.data.chat_id}/accept`);

    navigate(`/chat/${res.data.chat_id}`);
  } catch (err) {
    console.log(err);
  }
};

return (
    <div className="relative lg:ml-64">

      {/* 🔔 TOAST */}
      {toast && (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
          ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}
        `}>
          {toast.message}
        </div>
      )}
      
      <p className="text-xl mb-5 font-bold pb-3 mt-3 px-2 border-b-2 border-blue-800">
        Order Product
      </p>

      {loading && (
        <div className="grid md:grid-cols-2 sm:gap-6 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow animate-pulse">
              <div className="h-4 bg-gray-200 w-1/3 mb-3 rounded"></div>
              <div className="h-3 bg-gray-200 w-2/3 mb-2 rounded"></div>
              <div className="h-3 bg-gray-200 w-full mb-2 rounded"></div>
              <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
              <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
            </div>
          ))}
        </div>
      )}

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
                  className={`text-sm px-3 py-1 rounded ${
                    deletingId === order.id
                      ? "bg-gray-300 text-gray-500"
                      : "text-red-500 hover:bg-red-50"
                  }`}
                >
                  {deletingId === order.id ? "Deleting..." : "Delete"}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {order.first_name} {order.last_name}
              </p>
              <p className="text-sm text-gray-400 mb-2">
                {order.address}
              </p>
              <div className="border-t pt-2 space-y-2">
                {order.items?.map((item, i) => {
        const isSeller = item.seller_id === authUserId?.user?.id;
        return (
          <div
            key={i}
            className="flex items-center justify-between gap-3 text-sm border-b py-3"
          >

            {/* LEFT SIDE */}
            <div className="flex items-center gap-3">

              {/* IMAGE */}
              <img
                src={item.product?.image || "/placeholder.png"}
                alt={item.name}
                className="w-14 h-14 object-cover rounded-lg border"
              />

              {/* TEXT */}
              <div>
                <p className="font-medium">{item.name}</p>

                <p className="text-gray-400 text-xs line-clamp-2">
                  {item.product?.description || "No description available"}
                </p>

                <p className="text-gray-500 text-xs">
                  ₦{item.price} × {item.quantity}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE (MESSAGE BUTTON) */}
            {isSeller && (
              <button
                onClick={() =>
                  handleMessageSeller(item.seller_id, order.id)
                }
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Message
              </button>
            )}
             {item.unread_count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full">
                  {item.unread_count}
                </span>
              )}

              <button
              onClick={() => openChat(item.seller_id, order.id)}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              View Chat
            </button>

            <span
          className={`text-[10px] px-2 py-[2px] rounded-full ${
            item.chat_status === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          {item.chat_status}
        </span>
          </div>
        );
      })}
          
              </div>

              {/* TOTAL */}
              <div className="flex justify-between mt-3 font-semibold border-t pt-2">
                <span>Total</span>
                <span>₦{order.total_price}</span>
              </div>

            </div>
          ))}

          {/* EMPTY STATE */}
          {orders.length === 0 && (
            <div className="col-span-full text-xl font-bold text-center text-gray-900 py-10">
              No order Available
            </div>
          )}
        </div>
      )}

    </div>
  );
}