import { Delete, Loader2 } from "lucide-react";
import api from "../../../Api/axios";
import { useAuth } from "../../../layout/AuthProvider";
import { useEffect, useState } from "react";

const Order = ({chats, setActiveChat, setMessages, togglePopup, setChats}) => {
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

  const symbols = { USD: "$", NGN: "₦", EUR: "€"};



  const { user } = useAuth();

  const authUserId = user?.id;

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

  

    const getChatByOrder = (orderId) => {
  return Array.isArray(chats)
    ? chats.find(c => c.order_id === orderId)
    : null;
};

    const openChat = async (chat) => {
      if (!chat?.id) return;

      console.log("OPEN CHAT RECEIVED", chat);

      setActiveChat(chat); // now has `other`

      const res = await api.get(
        `/api/chats/${chat.id}/messages`
      );

      setMessages(res.data.messages || []);
    };
    const handleMessageUser = async (
  order
) => {
  if (!order) return;

  const currentUserId =
    authUserId;

  if (!currentUserId) return;

  const otherUserId =
    order.user_id === currentUserId
      ? order.seller_id
      : order.user_id;

  try {
    setChatLoading(order.id);

          const res = await api.post(
        "/api/chat/create",
        {
          user_id: otherUserId,
          order_id: order.id,
        }
      );

      const rawChat = res.data.chat;

      // build "other" manually
      const other = {
        id: otherUserId,
        first_name: order.first_name ?? "User",
        last_name: order.last_name ?? "Name",
      };

      // FINAL chat object (IMPORTANT)
      const chat = {
        ...rawChat,
        other,
      };
    setChats((prev) => {
      const exists = prev.some(
        (c) => c.id === chat.id
      );

      if (exists) return prev;

      return [chat, ...prev];
    });

    togglePopup();

    await openChat(chat);

  } catch (err) {
    console.error(
      "Chat failed",
      err
    );
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



const exchangeRatesToUSD = {
  USD: 1,
  NGN: 0.000735527,
  EUR: 1.09,
};

const totalInUSD =
  selectedOrder?.items?.reduce((total, item) => {
    const currency = item?.product?.currency || "USD";

    const price = Number(item?.price || 0);
    const quantity = Number(item?.quantity || 1);
    const discount = Number(item?.discount || 0);

    const subtotal =
      (price * quantity) - discount;

    const rate =
      exchangeRatesToUSD[currency] || 1;

    return total + (subtotal * rate);
  }, 0) || 0;

  return (
  <div className="relative lg:ml-64 px-4 text-[var(--text-color)]  bg-[var(--bg-color)] ">

    {/* 🔔 TOAST */}
    {toast && (
      <div className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg text-white z-50
        ${toast.type === "error" ? "bg-red-500" : "bg-green-600"}`}>
        {toast.message}
      </div>
    )}

    <h2 className="text-2xl font-bold mb-5 border-b-2 border-blue-800 pb-2">
      Product Order
    </h2>

    {/* 🔄 LOADING */}
   {loading && ( 
    <div className="flex flex-col gap-3"> 
    {[1, 2, 3, 4, 5, 6, 7, 8 ].map((i) => ( 
          <div key={i} className="bg-white p-5 rounded-xl shadow animate-pulse"> 
          <div className="h-28 bg-gray-200 w-2/3 mb-3 rounded"></div> 
          <div className="h-8 bg-gray-200 w-full mb-2 rounded"></div> 
      <div className="h-3 bg-gray-200 w-2/3 rounded"></div> </div> 
      ))} 
      </div> 
    )}

    {/* 📦 ORDERS */}
    {!loading && orders.length > 0 && (
  <div className="flex flex-col gap-2">

    {orders.map((order) => {

      // ============================================
      // BUYER / SELLER
      // ============================================

      const isBuyer =
        Number(order.user_id) === Number(authUserId);


      const items = Array.isArray(order.items)
        ? order.items
        : [];

      const firstItem = items[0];

      const sellerId =
        firstItem?.seller_id || null;


      const symbols = {
        USD: "$",
        NGN: "₦",
        EUR: "€",
      
      };

      const exchangeRatesToUSD = {
        USD: 1,
        NGN: 0.000735527,
        EUR: 1.09,
       
      };


      const totalQuantity = items.reduce(
        (total, item) =>
          total + Number(item?.quantity || 1),
        0
      );

      const totalInUSD = items.reduce(
        (total, item) => {

          const currency =
            item?.product?.currency || "USD";

          const price =
            Number(item?.product?.price || 0);

          const quantity =
            Number(item?.quantity || 1);

          const discount =
            Number(item?.product?.discount || 0);

          const rate =
            exchangeRatesToUSD[currency] ?? 1;

          const itemTotal =
            (price * quantity) - discount;

          return total + (
            itemTotal * rate
          );

        },
        0
      );

      const subTotalUSD = items.reduce(
        (total, item) => {

          const currency =
            item?.product?.currency || "USD";

          const price =
            Number(item?.product?.price || 0);

          const quantity =
            Number(item?.quantity || 1);

          const rate =
            exchangeRatesToUSD[currency] ?? 1;

          const itemTotal =
            (price * quantity)

          return total + (
            itemTotal * rate
          );

        },
        0
      );


      const disCountUSD = items.reduce(
        (total, item) => {

          const currency =
            item?.product?.currency || "USD";

          const discount =
            Number(item?.product?.discount || 0);

          const rate =
            exchangeRatesToUSD[currency] ?? 1;

          return total + (
            discount * rate
          );

        },
        0
      );


      const originalCurrency =
        firstItem?.currency || "USD";

      const originalSymbol =
        symbols[originalCurrency] ||
        originalCurrency;


     

      const chat =
        getChatByOrder(order.id);


      return (
        <div
          key={order.id}
          className="text-[var(--text-color)] bg-[var(--bg-color)] p-4 md:p-5
          border border-blue-500 rounded-2xl shadow-md flex flex-col gap-4"
        >

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">

          
            <div className="shrink-0">

              <img
                src={
                  firstItem?.product?.image
                    ? `http://localhost:8000/storage/${firstItem.product.image}`
                    : firstItem?.image
                      ? firstItem.image
                      : "/placeholder.png"
                }
                alt={
                  firstItem?.title ||
                  "Product"
                }
                className="w-20 h-20 rounded-xl object-cover"
              />

            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

              {/* DATE */}

              <div>

                <p className="text-xs font-medium">
                  Order Date
                </p>

                <p className="text-sm font-semibold">

                  {order.created_at
                    ? new Date(
                        order.created_at
                      ).toLocaleDateString()
                    : "N/A"}

                </p>

              </div>


              {/* CUSTOMER */}

              <div>

                <p className="text-xs font-medium">
                  Customer
                </p>

                <p className="text-sm font-semibold">

                  {order.first_name}{" "}
                  {order.last_name}

                </p>

              </div>


              {/* PRODUCTS */}

              <div>

                <p className="text-xs font-medium">
                  Products
                </p>

                <p className="text-sm font-semibold">
                  {items.length}
                </p>

              </div>


              {/* QUANTITY */}

              <div>

                <p className="text-xs font-medium">
                  Quantity
                </p>

                <p className="text-sm font-semibold">
                  {totalQuantity}
                </p>

              </div>


              <div>

                <p className="text-xs font-medium">
                  Total Price
                </p>

                <p className="text-sm font-bold text-green-700">

                  ${totalInUSD.toFixed(2)} USD
                </p>
              </div>


              {/* STATUS */}

              <div>

                <p className="text-xs font-medium">
                  Status
                </p>

                <span
                  className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-bold capitalize
                    ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "active"
                        ? "bg-green-100 text-green-700"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100"
                    }
                  `}
                >
                  {order.status}
                </span>

              </div>

            </div>


            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">

              {!isBuyer && sellerId && (

                order.status === "cancelled" ? (

                  <button
                    disabled
                    className="text-red-700 px-3 py-2 text-sm rounded font-bold cursor-not-allowed"
                  >
                    Cancelled
                  </button>

                ) : chat ? (

                  <button
                    onClick={() => openChat(chat)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm rounded font-bold"
                  >
                    Active
                  </button>

                ) : (

                  <button
                    onClick={() =>
                      handleMessageUser(order)
                    }
                    className="bg-blue-800 hover:bg-blue-900 text-white px-3 py-2 text-sm rounded font-bold"
                  >

                    {chatLoading === order.id
                      ? "Loading"
                      : "Message"}

                  </button>

                )

              )}


             
              {isBuyer &&
                order.status === "pending" &&
                !order.chat_created && (

                  <button
                    onClick={() => {

                      setSelectedOrderId(
                        order.id
                      );

                      setShowCancelModal(
                        true
                      );

                    }}
                    disabled={
                      cancelingId === order.id
                    }
                    className="px-3 py-2 text-sm rounded font-bold text-white bg-red-500 hover:bg-red-600 whitespace-nowrap"
                  >

                    {cancelingId === order.id
                      ? "Canceling"
                      : "Cancel"}

                  </button>

              )}


              <button
                onClick={() => {

                  setSelectedOrderId(
                    order.id
                  );

                  setShowDeleteModal(
                    true
                  );

                }}
                disabled={
                  deletingId === order.id
                }
                className="px-3 py-2 text-sm rounded font-bold bg-red-700 hover:bg-red-800 text-white"
              >

                {deletingId === order.id
                  ? "Deleting"
                  : "Delete"}

              </button>



              <button
                onClick={() => {

                  setSelectedOrder(
                    order
                  );

                  setShowModal(true);

                }}
                className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded whitespace-nowrap"
              >
                View Details
              </button>

            </div>

          </div>


          <div className="border-t pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* PRODUCT */}

            <div>

              <p className="text-xs">
                Product
              </p>

              <p className="text-sm font-semibold">

                {firstItem?.title ||
                  firstItem?.product?.name ||
                  "No product"}

              </p>

              {items.length > 1 && (

                <p className="text-xs mt-1">

                  + {items.length - 1} more product
                  {items.length - 1 > 1
                    ? "s"
                    : ""}

                </p>

              )}

            </div>


            {/* MESSAGE */}

            {order.message && (

              <div className="flex-1 sm:text-right">

                <p className="text-xs">
                  Message
                </p>

                <p className="text-sm">
                  {order.message}
                </p>

              </div>

            )}

          </div>


        
          <div className="border-t pt-3">

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">

              <div>

                <span>
                  Currency:
                </span>{" "}

                <span className="font-bold">
                  {originalCurrency}
                </span>

              </div>


              <div>

                <span>
                  Subtotal:
                </span>{" "}

                <span className="font-bold">

                  ${subTotalUSD
                  .toFixed(2)}

                </span>

              </div>


              <div>

                <span>
                  Discount:
                </span>{" "}

                <span className="font-bold text-red-500">

                  -${disCountUSD
                  .toFixed(2)}

                </span>

              </div>


              <div>

                <span>
                  USD Total:
                </span>{" "}

                <span className="font-bold text-green-700">

                  ${totalInUSD.toFixed(2)}

                </span>

              </div>

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
  <div className="fixed inset-0 z-[9999] bg-black/50 
    text-[var(--text-color)] flex items-center justify-center p-4">
      <div className="text-[var(--text-color)]  bg-[var(--bg-color)]  w-full max-w-md overflow-y-auto 
      scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin rounded-xl shadow-lg space-y-4">

      {/* HEADER */}
      <h2 className="text-lg font-bold mb-3 text-center border-b border-[var(--text-color)] py-3">
        Delete Order
      </h2>

      {/* MESSAGE */}
      <p className="text-[15px]  mb-5 text-center py-3 px-6">
        Are you sure you want to delete this order? This action cannot be undone.
      </p>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 py-3 px-3">

        {/* CANCEL */}
        <button
          onClick={() => setShowDeleteModal(false)}
          disabled={deletingId === selectedOrderId}
          className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
        >
          Cancel
        </button>

        {/* CONFIRM DELETE */}
        <button
          onClick={() => handleDelete(selectedOrderId)}
          disabled={deletingId === selectedOrderId}
          className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-white flex items-center gap-2"
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

    <div className="text-[var(--text-color)]  bg-[var(--bg-color)]  p-6 rounded-xl shadow-lg w-[90%] max-w-md">

      <h2 className="text-lg font-bold mb-3">
        Cancel Order
      </h2>

      <p className="text-sm mb-5">
        Are you sure you want to cancel this order?
      </p>

      <div className="flex justify-end gap-3">

        {/* CLOSE */}
        <button
          onClick={() => setShowCancelModal(false)}
          className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded text-white"
        >
          No
        </button>

        {/* CONFIRM */}
        <button
          onClick={async () => {
            await handleCancel(selectedOrderId);
            setShowCancelModal(false);
          }}
          className="px-4 py-2 text-sm bg-red-700 over:bg-red-800 text-white rounded"
        >
          {
            cancelingId ? <span className="
                animate-spin
                h-4
                w-4
                border-2
                border-white
                border-t-transparent
                rounded-full inline-flex items-center gap-2
            " /> : "Yes, Cancel"
          }
          
        </button>

      </div>
    </div>
  </div>
)}
    {showModal && selectedOrder && (
  <div
    className="fixed inset-0 z-[9999] bg-[var(--bg-color)]/50
    text-[var(--text-color)] backdrop-blur-md
    flex items-center justify-center p-4"
  >

    <div
      className="text-[var(--text-color)]
      bg-[var(--bg-color)]
      w-full max-w-3xl
      rounded-2xl
      p-5
      max-h-[90vh]
      overflow-y-auto
      scrollbar-thin"
    >

      {/* ================= HEADER ================= */}

      <div className="flex justify-between items-center border-b pb-3 mb-4">

        <div>
          <h2 className="font-bold text-lg">
            Order #{selectedOrder.id}
          </h2>

          <p className="text-xs mt-1">
            {selectedOrder.status}
          </p>
        </div>

        <button
          onClick={() => {
            setShowModal(false);
            setSelectedOrder(null);
          }}
          className="w-9 h-9 rounded-full
          flex items-center justify-center
          hover:bg-gray-200"
        >
          ✕
        </button>

      </div>


      {/* ================= CUSTOMER ================= */}

      <div className="shadow-md rounded-xl p-4 mb-5">

        <h1 className="text-xl font-bold border-b pb-2 mb-4">
          {selectedOrder.first_name}'s Info
        </h1>

        <div className="grid md:grid-cols-2 gap-4">

          {/* CUSTOMER */}

          <div className="shadow rounded-xl p-4">

            <p className="font-semibold mb-2">
              • {selectedOrder.first_name}{" "}
              {selectedOrder.last_name}
            </p>

            <p className="text-sm mb-2">
              • {selectedOrder.email}
            </p>

            <p className="text-sm">
              • {selectedOrder.phone}
            </p>

          </div>


          {/* ADDRESS */}

          <div className="shadow rounded-xl p-4">

            <p className="font-semibold mb-2">
              • {selectedOrder.address}
            </p>

            <p className="text-sm mb-2">
              • {selectedOrder.city},{" "}
              {selectedOrder.state}
            </p>

            <p className="text-sm">
              • ZIP: {selectedOrder.zip}
            </p>

          </div>

        </div>

      </div>


      {/* ================= ITEMS ================= */}

      <div className="space-y-3">

        <h3 className="font-bold text-lg">
          Order Products
        </h3>

        {selectedOrder.items?.map((item, i) => {

          const symbols = {
            USD: "$",
            NGN: "₦",
            EUR: "€",
          };

          const exchangeRatesToUSD = {
            USD: 1,
            NGN: 0.000735527,
            EUR: 1.09,
          };


          const currency = item?.product?.currency 

          const symbol =
            symbols[currency] || currency;

          const rate =
            exchangeRatesToUSD[currency] ?? 1;


          const price =
            Number(item?.price || 0);

          const quantity =
            Number(item?.quantity || 1);

          const discount =
            Number(item?.product?.discount || 0);


          const grossSubtotal =
            price * quantity;

          const finalSubtotal =
            grossSubtotal - discount;


          const priceUSD =
            price * rate;

          const discountUSD =
            discount * rate;

          const subtotalUSD =
            finalSubtotal * rate;


          return (

            <div
              key={item.id || i}
              className="border rounded-xl p-4"
            >

              <div className="flex flex-col sm:flex-row gap-4">

                {/* IMAGE */}

                <img
                  src={
                    item.product?.image
                      ? `http://localhost:8000/storage/${item.product.image}`
                      : item.image
                      ? item.image
                      : "/placeholder.png"
                  }
                  alt={item.title || "Product"}
                  className="w-full sm:w-24 h-24
                  rounded-xl object-cover shrink-0"
                />


                {/* INFORMATION */}

                <div className="flex-1">

                  {/* TITLE + PRICE */}

                  <div
                    className="flex flex-col
                    sm:flex-row
                    sm:justify-between
                    gap-2"
                  >

                    <div>

                      <h4 className="font-bold">
                        {item.title ||
                          item.product?.name ||
                          "Unnamed Product"}
                      </h4>

                      {item.description && (
                        <p className="text-xs mt-1">
                          {item.description}
                        </p>
                      )}

                    </div>


                    {/* ORIGINAL PRICE */}

                    <div className="text-left sm:text-right">

                      <p className="font-bold text-green-600">
                        {symbol}
                        {price.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                      <p className="text-xs">
                        $
                        {priceUSD.toFixed(2)}
                        {" "}USD
                      </p>

                    </div>

                  </div>


                  {/* DETAILS */}

                  <div
                    className="flex flex-wrap
                    gap-x-5 gap-y-2
                    mt-4 text-xs sm:text-sm"
                  >

                    {/* QUANTITY */}

                    <div>

                      <span>
                        Quantity:
                      </span>{" "}

                      <span className="font-semibold">
                        {quantity}
                      </span>

                    </div>


                    {/* PRICE */}

                    <div>

                      <span>
                        Price:
                      </span>{" "}

                      <span className="font-semibold">
                        {symbol}
                        {price.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>

                    </div>


                    {/* DISCOUNT */}

                    {discount > 0 && (

                      <div>

                        <span>
                          Discount:
                        </span>{" "}

                        <span
                          className="font-semibold
                          text-red-500"
                        >
                          {symbol}
                          {discount.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>

                        <span
                          className="text-xs ml-1"
                        >
                          ($
                          {discountUSD.toFixed(2)}
                          USD)
                        </span>

                      </div>

                    )}


                    {/* SUBTOTAL */}

                    <div>

                      <span>
                        Subtotal:
                      </span>{" "}

                      <span
                        className="font-bold
                        text-green-600"
                      >
                        {symbol}
                        {finalSubtotal.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>

                      <span
                        className="text-xs ml-1"
                      >
                        ($
                        {subtotalUSD.toFixed(2)}
                        USD)
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          );

        })}

      </div>


      {/* ================= ORDER TOTAL ================= */}

      {(() => {

        const symbols = {
          USD: "$",
          NGN: "₦",
          EUR: "€",
          GBP: "£",
        };

        const exchangeRatesToUSD = {
          USD: 1,
          NGN: 0.000735527,
          EUR: 1.09,
          GBP: 1.27,
        };


        const subtotalUSD =
          selectedOrder.items?.reduce(
            (total, item) => {

              const currency = item?.product?.currency

              const price =
                Number(item?.price || 0);

              const quantity =
                Number(item?.quantity || 1);

              const rate =
                exchangeRatesToUSD[currency] ?? 1;

              return total +
                (
                  price *
                  quantity *
                  rate
                );

            },
            0
          ) || 0;


        const discountUSD =
          selectedOrder.items?.reduce(
            (total, item) => {

              const currency =
                item?.currency ||
                item?.product?.currency ||
                "USD";

              const discount =
                Number(item?.discount || 0);

              const rate =
                exchangeRatesToUSD[currency] ?? 1;

              return total +
                (
                  discount *
                  rate
                );

            },
            0
          ) || 0;


        const deliveryUSD =
          Number(
            selectedOrder.delivery_price || 0
          );


        const totalUSD =
          subtotalUSD -
          discountUSD +
          deliveryUSD;


        return (

          <div
            className="mt-5
            border-t
            pt-4
            space-y-3"
          >

            {/* SUBTOTAL */}

            <div
              className="flex
              justify-between
              items-center"
            >

              <span className="font-semibold">
                Subtotal
              </span>

              <span className="font-bold">
                $
                {subtotalUSD.toFixed(2)}
                {" "}
              </span>

            </div>


            {/* DISCOUNT */}

            {discountUSD > 0 && (

              <div
                className="flex
                justify-between
                items-center"
              >

                <span className="font-semibold">
                  Discount
                </span>

                <span
                  className="font-bold
                  text-red-500"
                >
                  -$
                  {discountUSD.toFixed(2)}
                  {" "}
                </span>

              </div>

            )}


            {/* DELIVERY */}

            {deliveryUSD > 0 && (

              <div
                className="flex
                justify-between
                items-center"
              >

                <span className="font-semibold">
                  Delivery
                </span>

                <span className="font-bold">
                  $
                  {deliveryUSD.toFixed(2)}
                  {" "}
                </span>

              </div>

            )}


            {/* TOTAL */}

            <div
              className="flex
              justify-between
              items-center
              border-t
              pt-3"
            >

              <span className="text-lg font-bold">
                Total
              </span>

              <div className="text-right">

                <p
                  className="text-xl
                  font-bold
                  text-green-600"
                >
                  $
                  {totalUSD.toFixed(2)}
                  {" "}
                </p>

              </div>

            </div>

          </div>

        );

      })()}

    </div>

  </div>
)}
  </div>
);
};

export default Order;