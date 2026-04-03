import { Delete, Loader2 } from "lucide-react";
import api from "../../../Api/axios";
import { useAuth } from "../../../layout/AuthProvider";
import { useEffect, useState } from "react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [chatLoading, setChatLoading] = useState(null);
  const [activeChats, setActiveChats] = useState([]); // store orderIds
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const symbols = { USD: "$", NGN: "₦", EUR: "€", GBP: "£" };


  const { user } = useAuth();
  const authUserId = user?.id;

  console.log("order", authUserId)
  console.log("order id", authUserId?.id)
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/orders", {
        params: {
          user_id: authUserId,
        },
      });

      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      setToast({ type: "error", message: "Failed to fetch orders" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUserId) {
      fetchOrders();
    }
  }, [authUserId]);



  const handleDelete = async (id) => {
  try {
    setDeletingId(id);

    await api.delete(`/api/orders/${id}`, {
      data: { user_id: authUserId },
    });

    setOrders(prev => prev.filter(order => order.id !== id));

    setToast({ type: "success", message: "Order removed" });

    setShowDeleteModal(false); // ✅ CLOSE MODAL

  } catch (err) {
    setToast({ type: "error", message: "Delete failed" });
  } finally {
    setDeletingId(null);
  }
};

  


  const handleMessageSeller = async (sellerId, orderId) => {
  try {
    setChatLoading(orderId);

    const res = await api.post("/api/chat/create", {
      seller_id: sellerId,
      order_id: orderId,
      user_id: authUserId,
    });

    // ✅ Mark chat as active
    setActiveChats((prev) => [...prev, orderId]);

    setToast({ type: "success", message: "Chat created" });

  } catch {
    setToast({ type: "error", message: "Chat failed" });
  } finally {
    setChatLoading(null);
  }
};


  const handleCancel = async (id) => {
  try {
    setCancelingId(id);

    const res = await api.post(`/api/order/cancel/${id}`, {
      user_id: authUserId
    });

    if (res.data.success) {
      setToast({ type: "success", message: res.data.message });

      fetchOrders(); // refresh list
    }

  } catch (err) {
    setToast({ type: "error", message: "Cancel failed" });
  } finally {
    setCancelingId(null);
  }
};


  return (
  <div className="relative lg:ml-64 p-4">

    {/* 🔔 TOAST */}
    {toast && (
      <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
        ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
        {toast.message}
      </div>
    )}

    <h2 className="text-2xl font-bold mb-5 border-b-2 border-blue-800 pb-2">
      My Orders
    </h2>

    {/* 🔄 LOADING */}
   {loading && ( 
    <div className="grid md:grid-cols-2 gap-3"> 
    {[1, 2, 3, 4, 5, 6, 7, 8 ].map((i) => ( 
          <div key={i} className="bg-white p-5 rounded-xl shadow animate-pulse"> 
          <div className="h-4 bg-gray-200 w-1/3 mb-3 rounded"></div> 
          <div className="h-3 bg-gray-200 w-full mb-2 rounded"></div> 
      <div className="h-3 bg-gray-200 w-2/3 rounded"></div> </div> 
      ))} 
      </div> 
    )}

    {/* 📦 ORDERS */}
    {!loading && orders.length > 0 && (
      <div className="grid md:grid-cols-2 gap-6">

        {orders.map((order) => {
          const isBuyer = order.user_id === authUserId;

          const firstItem = order.items?.[0];
          const sellerId = firstItem?.seller_id;
          const isSeller = sellerId === authUserId;

          const currency = firstItem?.product?.currency;
          const symbol = symbols[currency] || currency;


          return (
            <div key={order.id} className="bg-white p-5 rounded-2xl shadow">

              {/* HEADER */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Order #{order.id}</h3>

                <div className="flex items-center gap-2">

                  {/* ✅ ONE MESSAGE BUTTON */}
                  {!isBuyer && sellerId && (
                order.status === "cancelled" ? (
                  <button className="bg-red-700 text-white px-3 py-2 text-sm rounded whitespace-nowrap font-bold cursor-not-allowed">
                    Order Cancelled
                  </button>
                ) : activeChats.includes(order.id) ? (
                  <button className="bg-green-600 text-white px-3 py-2 text-sm rounded font-bold cursor-not-allowed">
                    Active
                  </button>
                ) : (
                  <button
                    onClick={() => handleMessageSeller(sellerId, order.id)}
                    className="bg-blue-600 text-white px-3 py-2 text-sm rounded font-bold"
                  >
                    {chatLoading === order.id ? "Loading..." : "Message"}
                  </button>
                )
              )}
                  {/* ✅ STATUS */}
                  

                  {/* ✅ DELETE (ONLY ONE) */}
                  {/*  */}

                  {isBuyer && (
                  <button
                    disabled={
                      cancelingId === order.id ||
                      order.status !== "pending"
                    }
                    className={`px-3 py-2 text-sm rounded font-bold text-white whitespace-nowrap
                      ${
                        order.status === "cancelled"
                          ? "bg-red-700 hidden cursor-not-allowed"
                          : order.chat_created
                          ? "bg-green-600 cursor-not-allowed"
                          : order.status === "pending"
                          ? "bg-blue-500 hover:bg-red-600 cursor-not-allowed"
                          : order.status === "active"
                          ? "bg-gray-400 cursor-not-allowed"
                          : "hidden"
                      }
                    `}
                  >
                    {cancelingId === order.id
                      ? "Canceling..."
                      : order.status === "cancelled"
                      ? "Cancelled"
                      : order.chat_created
                      ? "Active"
                      : order.status === "pending"
                      ? "Pending"
                      : order.status === "active"
                      ? "Active"
                      : ""}
                  </button>
                )}

                   <button
                      onClick={() => {
                          setSelectedOrderId(order.id);
                          setShowDeleteModal(true);
                        }}
                      disabled={deletingId === order.id}
                      className="px-3 py-2 text-sm rounded font-bold bg-red-500 text-white">
                    Delete
                  </button>

                  </div>
                </div>
                        

              {/* USER */}
              <p className="text-sm text-gray-800">
                • {order.first_name} {order.last_name}
              </p>

              <p className="text-sm text-gray-800 mb-3">
                • {order.address}
              </p>

              {/* ITEMS */}
              <div className="border-t pt-2 space-y-3">

                {order.items?.map((item, i) => {

                const symbol = symbols[item?.product?.currency] || item?.product?.currency;
                  
                  
                  return (
                    <div key={i} className="flex justify-between gap-3 border-b py-3">

                      {/* LEFT */}
                      <div className="flex gap-3 items-center">

                      <img
                        src={
                          item.product?.image
                            ? `http://localhost:8000/storage/${item.product.image}`
                            : "/placeholder.png"
                        }
                        className="w-20 h-20 rounded object-cover"
                      />

                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <div className="relative">
                        <p className="text-sm text-gray-700">
                         {symbol}{item.price} × {item.quantity}
                        </p>

                        {item.discount > 0 && (
                          <p className="text-xs text-red-500 whitespace-nowrap absolute top-0 right-0 translate-x-8 font-bold">
                           -{symbol}{item.discount}
                          </p>
                         )} 
                        </div>

                      </div>
                        
                    </div>
                     <p className="text-sm font-semibold text-green-700 mt-1">
                        Subtotal: {symbol}{(item.price * item.quantity) - (item.discount || 0)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* TOTAL */}
              <div className="flex justify-between mt-3 font-semibold border-t pt-2">
                <div>
                <span>Total:</span>
                <span className="text-green-800 font-bold"> {symbol}{order.total_price}</span>
                </div>

                <div className="inline-flex items-center gap-1">
                {isBuyer && (
                <>
                  {/* ✅ PENDING (NO CHAT) */}
                  {order.status === "pending" && !order.chat_created && (
                    <button
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setShowCancelModal(true);
                      }}
                      disabled={cancelingId === order.id}
                      className="px-3 py-2 text-sm rounded font-bold text-white bg-red-500 hover:bg-red-600 whitespace-nowrap"
                    >
                      {cancelingId === order.id ? "Canceling..." : "Cancel Order"}
                    </button>
                  )}

                  {/* ✅ CANCELLED */}
                  {order.status === "cancelled" && (
                    <span className="px-3 py-2 text-sm font-bold text-red-600 whitespace-nowrap">
                      Order Cancelled
                    </span>
                  )}
                </>
              )}
                <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowModal(true);
                }}
                className="text-sm bg-gray-900 text-white px-2 py-2 rounded whitespace-nowrap"
              >
                View Details
              </button>
              </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* ❌ EMPTY */}
    {!loading && orders.length === 0 && (
      <div className="text-center font-bold py-10">
        No Order Available
      </div>
    )}

    {/* ================= MODAL ================= */}

    {showDeleteModal && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">

    <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6">

      {/* HEADER */}
      <h2 className="text-lg font-bold mb-3 text-red-600">
        Delete Order
      </h2>

      {/* MESSAGE */}
      <p className="text-sm text-gray-600 mb-5">
        Are you sure you want to delete this order? This action cannot be undone.
      </p>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3">

        {/* CANCEL */}
        <button
          onClick={() => setShowDeleteModal(false)}
          disabled={deletingId === selectedOrderId}
          className="px-4 py-2 rounded bg-gray-200 text-gray-700"
        >
          Cancel
        </button>

        {/* CONFIRM DELETE */}
        <button
          onClick={() => handleDelete(selectedOrderId)}
          disabled={deletingId === selectedOrderId}
          className="px-4 py-2 rounded bg-red-500 text-white flex items-center gap-2"
        >
          {deletingId === selectedOrderId ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Deleting
            </>
          ) : (
            "Delete"
          )}
        </button>

      </div>
    </div>
  </div>
)}

    {showCancelModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">

      <h2 className="text-lg font-bold mb-3">
        Cancel Order
      </h2>

      <p className="text-sm text-gray-600 mb-5">
        Are you sure you want to cancel this order?
      </p>

      <div className="flex justify-end gap-3">

        {/* CLOSE */}
        <button
          onClick={() => setShowCancelModal(false)}
          className="px-4 py-2 text-sm bg-gray-200 rounded"
        >
          No
        </button>

        {/* CONFIRM */}
        <button
          onClick={async () => {
            await handleCancel(selectedOrderId);
            setShowCancelModal(false);
          }}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded"
        >
          {
            cancelingId ? <Loader2 /> : "Yes, Cancel"
          }
          
        </button>

      </div>
    </div>
  </div>
)}
    {showModal && selectedOrder && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

        <div className="bg-white w-full max-w-3xl rounded-2xl p-5 max-h-[90vh] overflow-y-auto">

          {/* HEADER */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="font-bold text-lg">
              Order #{selectedOrder.id}
            </h2>

            <button onClick={() => setShowModal(false)}>
              ✕
            </button>
          </div>

          {/* CUSTOMER + ADDRESS */}
          <div className="bg- shadow-md rounded-xl p-2 sm:p-4 bg-gray-50 ">
            <h1 className="text-2xl font-bold border-b-2 border-blue-800 pb-2 ">{selectedOrder.first_name}'s Info</h1>
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            
            <div className="bg-white shadow my-3 dots p-4 rounded sm:p-4 p-2">
              <p className="font-semibold mb-2">
                • {selectedOrder.first_name} {selectedOrder.last_name}
              </p>
              <p className="text-sm mb-2">• {selectedOrder.email}</p>
              <p className="text-sm mb-2">• {selectedOrder.phone}</p>
            </div>

             <div className="bg-white shadow my-3 dots p-4 rounded sm:p-4 p-2">
              <p className="font-semibold mb-2">• {selectedOrder.address}</p>
              <p className="text-sm mb-2">• {selectedOrder.city}, • {selectedOrder.state}</p>
              <p className="text-sm mb-2">• ZIP: {selectedOrder.zip}</p>
            </div>

            </div>


          </div>

          {/* ITEMS */}
          {selectedOrder.items.map((item, i) => {

                const symbol = symbols[item?.product?.currency] || item?.product?.currency;
                  
                  
                  return (
                    <div key={i} className="flex justify-between gap-3 border-b py-3">

                      {/* LEFT */}
                      <div className="flex gap-3 items-center">

                      <img
                        src={
                          item.product?.image
                            ? `http://localhost:8000/storage/${item.product.image}`
                            : "/placeholder.png"
                        }
                        className="w-20 h-20 rounded object-cover"
                      />

                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <div className="relative">
                        <p className="text-sm text-gray-700">
                         {symbol}{item.price} × {item.quantity}
                        </p>

                        {item.discount > 0 && (
                          <p className="text-xs text-red-500 absolute whitespace-nowrap top-0 left-20 font-bold">
                           -{symbol}{item.discount}
                          </p>
                         )} 
                        </div>

                      </div>
                        
                    </div>
                     <p className="text-sm font-semibold text-green-700 mt-1">
                        Subtotal: {symbol}{(item.price * item.quantity) - (item.discount || 0)}
                      </p>
                    </div>
                  );
                })}

          {/* TOTAL */}
          <div className="mt-4 font-bold flex justify-between">
            <span>Total</span>
            <span>₦{selectedOrder.total_price}</span>
          </div>

        </div>
      </div>
    )}
  </div>
);
};

export default OrdersPage;