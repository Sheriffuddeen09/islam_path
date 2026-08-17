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
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showDraftDetails, setShowDraftDetails] = useState(false);



  const { user } = useAuth() || {};

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
    const res = await api.get("/api/product/drafts");

    console.log("DRAFT RESPONSE:", res.data);

    setDrafts(res.data || []);

  } catch (err) {
    console.error("Fetch drafts error:", err);

    showToast(
      err?.response?.data?.message || "Failed to load drafts",
      "error"
    );

  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  if (user?.id) {
    fetchDrafts();
  }
}, [user?.id]);

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
  <div className="text-[var(--text-color)]  bg-[var(--bg-color)]  px-3 sm:px-4 md:px-6 lg:ml-64">

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
    <h2 className="text-lg sm:text-xl text-[var(--text-color)] font-bold mb-4 sm:mb-5 border-b-2 border-blue-800 pb-2">
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
  <div className="flex flex-col gap-3 sm:gap-5">

    {drafts.map((draft) => {

      const data = draft?.data || {};

      const items = Array.isArray(data?.items)
        ? data.items
        : [];

      const totalItems = items.length;

      const totalQuantity = items.reduce(
        (total, item) =>
          total + Number(item?.quantity || 1),
        0
      );

      const firstItem = items[0];

      const symbols = {
        USD: "$",
        NGN: "₦",
        EUR: "€",
      };

      const exchangeRatesToUSD = {
        USD: 1,
        NGN: 0.000735527,
        EUR: 1.09,
        GBP: 1.27,
      };

      const totalInUSD = items.reduce(
        (total, item) => {

          const currency =
            item?.currency || "USD";

          const price =
            Number(item?.price || 0);

          const quantity =
            Number(item?.quantity || 1);

          const discount =
            Number(item?.discount || 0);

          const rate =
            exchangeRatesToUSD[currency] ?? 1;

          const itemTotal =
            (price * quantity) - discount;

          return total + (itemTotal * rate);
        },
        0
      );

      const originalCurrency =
        firstItem?.currency || "USD";

      const originalSymbol =
        symbols[originalCurrency] ||
        originalCurrency;

      const originalTotal = items.reduce(
        (total, item) => {

          const price =
            Number(item?.price || 0);

          const quantity =
            Number(item?.quantity || 1);

          const discount =
            Number(item?.discount || 0);

          return (
            total +
            (price * quantity) -
            discount
          );
        },
        0
      );



      return (
        <div
          key={draft.id}
          className="text-[var(--text-color)] bg-[var(--bg-color)] border border-blue-500 p-4 sm:p-5 rounded-2xl shadow-md hover:shadow-lg transition flex flex-col gap-4"
        >

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">

            {/* ONLY ONE PRODUCT IMAGE */}
            <div className="shrink-0">
              <img
                src={firstItem?.image || "/placeholder.png"}
                alt={firstItem?.name || "Product"}
                className="w-20 h-20 rounded-xl object-cover"
              />
            </div>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

              {/* DATE */}
              <div>
                <p className="text-xs  font-medium">
                  Saved Date
                </p>

                <p className="text-sm font-semibold">
                  {draft.created_at
                    ? new Date(draft.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              {/* USER */}
              <div>
                <p className="text-xs  font-medium">
                  Customer
                </p>

                <p className="text-sm font-semibold">
                  {user?.first_name} {user?.last_name}
                </p>
              </div>

              {/* PRODUCTS */}
              <div>
                <p className="text-xs  font-medium">
                  Products
                </p>

                <p className="text-sm font-semibold">
                  {totalItems}
                </p>
              </div>

              {/* QUANTITY */}
              <div>
                <p className="text-xs  font-medium">
                  Quantity
                </p>

                <p className="text-sm font-semibold">
                  {totalQuantity}
                </p>
              </div>

              {/* TOTAL PRICE */}
              <div>
                <p className="text-xs  font-medium">
                  Total Price
                </p>

                <p className="text-sm font-bold text-green-700">
                  $ {totalInUSD.toFixed(2)}
                </p>
              </div>

              {/* STATUS */}
              <div>
                <p className="text-xs  font-medium">
                  Status
                </p>

                <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                  Saved
                </span>
              </div>

            </div>

            {/* ================= ACTIONS ================= */}
            <div className="flex flex-wrap items-center gap-2 lg:ml-auto">

              {/* ORDER */}
              <button
                onClick={async () => {
                  try {
                    setOrderingId(draft.id);

                    const payload = {
                      ...data,

                      order_token:
                        data?.order_token ||
                        `${Date.now()}_${user?.id}`,

                      user_id: user?.id,
                      first_name: user?.first_name,
                      last_name: user?.last_name,
                      email: user?.email,
                      phone: user?.phone,

                      address: data?.address || "No address",
                      city: data?.city || "No city",
                      state: data?.state || "No state",
                      zip: data?.zip || "0000",

                      payment_method: "save",
                    };

                    await api.post(
                      "/api/order/create",
                      payload
                    );

                    // DELETE DRAFT AFTER ORDER
                    await api.delete(
                      `/api/product/draft/${draft.id}`
                    );

                    // REMOVE FROM UI
                    setDrafts((prev) =>
                      prev.filter(
                        (d) => d.id !== draft.id
                      )
                    );

                    showToast(
                      "Order placed successfully!"
                    );

                  } catch (err) {
                    console.error(err);

                    showToast(
                      err?.response?.data?.message ||
                        "Order failed",
                      "error"
                    );

                  } finally {
                    setOrderingId(null);
                  }
                }}
                disabled={orderingId === draft.id}
                className={`px-3 py-2 rounded text-sm font-bold text-white transition flex items-center justify-center whitespace-nowrap
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
                        className=""
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      />

                      <path
                        className=""
                        fill="white"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>

                    Ordering
                  </span>
                ) : (
                  "Order"
                )}
              </button>

              {/* DELETE */}
             <button
              onClick={() => setDeleteId(draft.id)}
              disabled={deleting}
              className="px-3 py-2 rounded text-sm font-bold
              text-white bg-red-500 hover:bg-red-600
              disabled:opacity-50 disabled:cursor-not-allowed
              whitespace-nowrap"
            >
              Delete
            </button>

                {/* VIEW DETAILS */}
              <button
                onClick={() => {
                  setSelectedDraft(draft);
                  setShowDraftDetails(true);
                }}
                className="px-3 py-2 rounded text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 whitespace-nowrap"
              >
                View Details
              </button>
            </div>

          </div>

          {/* ================= BOTTOM INFORMATION ================= */}
          <div className="border-t pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            {/* FIRST PRODUCT */}
            <div>
              <p className="text-xs ">
                Product
              </p>

              <p className="text-sm font-semibold">
                {firstItem?.name || "No product"}
              </p>

              {totalItems > 1 && (
                <p className="text-xs  mt-1">
                  + {totalItems - 1} more product
                  {totalItems - 1 > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* ADDRESS */}
            <div>
              <p className="text-xs ">
                Delivery Address
              </p>

              <p className="text-sm">
                {data?.address || "No address"}
              </p>
            </div>

          </div>

        </div>
      );
    })}

{deleteId && (

  <div
    className="fixed inset-0 z-[99999]
    bg-black/60
    backdrop-blur-sm
    flex items-center justify-center
    p-4"
    onClick={() => {
      if (!deleting) {
        setDeleteId(null);
      }
    }}
  >

    <div
      className="w-full max-w-md
      bg-[var(--bg-color)]
      text-[var(--text-color)]
      rounded-2xl
      shadow-2xl
      p-6"
      onClick={(e) => e.stopPropagation()}
    >

      {/* ================= ICON ================= */}

      <div className="flex justify-center mb-4">

        <div
          className="w-14 h-14
          rounded-full
          bg-red-100
          text-red-600
          flex items-center justify-center"
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7"
          >

            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM10.29 3.86l-8.07 14a1.5 1.5 0 001.3 2.25h17a1.5 1.5 0 001.3-2.25l-8.07-14a1.5 1.5 0 00-2.6 0Z"
            />

          </svg>

        </div>

      </div>


      {/* ================= TITLE ================= */}

      <h2 className="text-lg font-bold text-center">

        Delete Saved Order?

      </h2>


      {/* ================= MESSAGE ================= */}

      <p className="text-sm text-center mt-2 opacity-80">

        Are you sure you want to delete this
        saved order?

      </p>

      <p className="text-xs text-center mt-2 text-red-500">

        This action cannot be undone.

      </p>


      {/* ================= BUTTONS ================= */}

      <div className="flex justify-end gap-3 mt-6">

        {/* CANCEL */}

        <button
          type="button"
          disabled={deleting}
          onClick={() => setDeleteId(null)}
          className="px-4 py-2
          text-sm
          font-semibold
          bg-gray-600
          hover:bg-gray-700
          text-white
          rounded-lg
          disabled:opacity-50
          disabled:cursor-not-allowed"
        >
          No, Keep It
        </button>


        {/* DELETE */}

        <button
          type="button"
          disabled={deleting}
          onClick={confirmDelete}
          className="px-4 py-2
          text-sm
          font-semibold
          bg-red-600
          hover:bg-red-700
          text-white
          rounded-lg
          flex items-center
          justify-center
          gap-2
          min-w-[110px]
          disabled:opacity-50
          disabled:cursor-not-allowed"
        >

          {deleting ? (

            <>
              <span
                className="animate-spin
                h-4 w-4
                border-2
                border-white
                border-t-transparent
                rounded-full"
              />

              Deleting

            </>

          ) : (

            "Yes, Delete"

          )}

        </button>

      </div>

    </div>

  </div>

)}


{showDraftDetails && selectedDraft && (
  <div
    className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-3 sm:p-4"
    onClick={() => {
      setShowDraftDetails(false);
      setSelectedDraft(null);
    }}
  >

    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        w-full
        max-w-5xl
        max-h-[92vh]
        rounded-2xl
        shadow-2xl
        overflow-hidden
        flex
        flex-col
      "
      onClick={(e) => e.stopPropagation()}
    >

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-b shrink-0">

        <div className="min-w-0">

          <h2 className="text-lg sm:text-xl font-bold">
            Saved Order Details
          </h2>

          <p className="text-xs sm:text-sm mt-1 ">
            Saved Order #{selectedDraft.id}
          </p>

          {selectedDraft.created_at && (
            <p className="text-xs mt-1 ">
              Saved on{" "}
              {new Date(
                selectedDraft.created_at
              ).toLocaleDateString()}
            </p>
          )}

        </div>


        {/* CLOSE */}
        <button
          type="button"
          onClick={() => {
            setShowDraftDetails(false);
            setSelectedDraft(null);
          }}
          className="
            w-9
            h-9
            shrink-0
            rounded-full
            bg-gray-100
            hover:bg-gray-200
            text-gray-700
            font-bold
            flex
            items-center
            justify-center
            transition
          "
        >
          ✕
        </button>

      </div>

      <div
        className="
          overflow-y-auto
          flex-1
          p-4
          sm:p-5
          scrollbar
          scrollbar-thumb-gray-300
          scrollbar-track-transparent
          scrollbar-thin
        "
      >

        {(() => {

          const draftData =
            selectedDraft?.data || {};

          const items =
            Array.isArray(draftData?.items)
              ? draftData.items
              : [];

          const formatNumber = (value) => {
            const number = Number(value || 0);

            return number.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            );
          };


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

          const totalQuantity =
            items.reduce(
              (total, item) =>
                total +
                Number(item?.quantity || 1),
              0
            );

          const totalSubtotalUSD =
            items.reduce(
              (total, item) => {

                const currency =
                  item?.currency || "NGN";


                const price =
                  Number(item?.price || 0);


                const quantity =
                  Number(item?.quantity || 1);


                const rate =
                  exchangeRatesToUSD[currency] ??
                  1;


                return (
                  total +
                  (
                    price *
                    quantity *
                    rate
                  )
                );

              },
              0
            );

          const totalDiscountUSD =
            items.reduce(
              (total, item) => {

                const currency =
                  item?.currency || "NGN";


                const discount =
                  Number(item?.discount || 0);


                const rate =
                  exchangeRatesToUSD[currency] ??
                  1;


                return (
                  total +
                  (
                    discount *
                    rate
                  )
                );

              },
              0
            );

          const totalInUSD =
            totalSubtotalUSD -
            totalDiscountUSD;

          const deliveryPrice =
            Number(
              draftData?.delivery_price || 0
            );

          const deliveryCurrency =
            draftData?.currency ||
            items?.[0]?.currency ||
            "NGN";


          const deliveryRate =
            exchangeRatesToUSD[
              deliveryCurrency
            ] ?? 1;


          const deliveryUSD =
            deliveryPrice *
            deliveryRate;

          const finalTotalUSD =
            totalInUSD +
            deliveryUSD;

          if (items.length === 0) {

            return (
              <div className="py-12 text-center">

                <div className="text-4xl mb-3">
                  🛒
                </div>

                <p className="font-semibold">
                  No products found
                </p>

                <p className="text-sm  mt-1">
                  This saved order does not contain
                  any products.
                </p>

              </div>
            );

          }


          return (
            <>

              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-4
                  gap-3
                  mb-5
                "
              >

                {/* CUSTOMER */}

                <div
                  className="
                    bg-gray-50
                    dark:bg-gray-800
                    p-3
                    rounded-xl
                  "
                >

                  <p className="text-xs ">
                    Customer
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    {draftData?.first_name ||
                      user?.first_name ||
                      ""}{" "}

                    {draftData?.last_name ||
                      user?.last_name ||
                      ""}
                  </p>

                </div>


                {/* PRODUCTS */}

                <div
                  className="
                    bg-gray-50
                    dark:bg-gray-800
                    p-3
                    rounded-xl
                  "
                >

                  <p className="text-xs ">
                    Products
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    {items.length}
                  </p>

                </div>


                {/* QUANTITY */}

                <div
                  className="
                    bg-gray-50
                    dark:bg-gray-800
                    p-3
                    rounded-xl
                  "
                >

                  <p className="text-xs ">
                    Quantity
                  </p>

                  <p className="text-sm font-semibold mt-1">
                    {totalQuantity}
                  </p>

                </div>


                {/* TOTAL USD */}

                <div
                  className="
                    bg-gray-50
                    dark:bg-gray-800
                    p-3
                    rounded-xl
                  "
                >

                  <p className="text-xs ">
                    Total
                  </p>

                  <p className="text-sm font-bold text-green-700 mt-1">
                    ${formatNumber(finalTotalUSD)}
                  </p>

                </div>

              </div>

              <div className="border rounded-xl p-4 mb-5">

                <div className="flex items-center justify-between gap-3 mb-4">

                  <h3 className="font-bold text-sm sm:text-base">
                    Delivery Information
                  </h3>

                  <span
                    className="
                      text-xs
                      px-2
                      py-1
                      rounded-full
                      bg-yellow-100
                      text-yellow-700
                      font-semibold
                    "
                  >
                    Saved
                  </span>

                </div>


                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-3
                    text-sm
                  "
                >

                  {/* NAME */}

                  <div>
                    <span className="">
                      Name:
                    </span>{" "}

                    <span className="font-medium">
                      {draftData?.first_name ||
                        user?.first_name ||
                        "N/A"}{" "}

                      {draftData?.last_name ||
                        user?.last_name ||
                        ""}
                    </span>
                  </div>


                  {/* EMAIL */}

                  <div>
                    <span className="">
                      Email:
                    </span>{" "}

                    <span className="font-medium break-all">
                      {draftData?.email ||
                        user?.email ||
                        "N/A"}
                    </span>
                  </div>


                  {/* PHONE */}

                  <div>
                    <span className="">
                      Phone:
                    </span>{" "}

                    <span className="font-medium">
                      {draftData?.phone ||
                        user?.phone ||
                        "N/A"}
                    </span>
                  </div>


                  {/* ADDRESS */}

                  <div>
                    <span className="">
                      Address:
                    </span>{" "}

                    <span className="font-medium">
                      {draftData?.address ||
                        "No address"}
                    </span>
                  </div>


                  {/* CITY */}

                  <div>
                    <span className="">
                      City:
                    </span>{" "}

                    <span className="font-medium">
                      {draftData?.city ||
                        "No city"}
                    </span>
                  </div>


                  {/* STATE */}

                  <div>
                    <span className="">
                      State:
                    </span>{" "}

                    <span className="font-medium">
                      {draftData?.state ||
                        "No state"}
                    </span>
                  </div>


                  {/* ZIP */}

                  <div>
                    <span className="">
                      ZIP:
                    </span>{" "}

                    <span className="font-medium">
                      {draftData?.zip ||
                        "0000"}
                    </span>
                  </div>

                </div>

              </div>


              <div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    mb-3
                  "
                >

                  <h3 className="font-bold text-sm sm:text-base">
                    All Products
                  </h3>

                  <span className="text-xs ">
                    {items.length} product
                    {items.length !== 1
                      ? "s"
                      : ""}
                  </span>

                </div>


                <div className="flex flex-col gap-3">

                  {items.map(
                    (item, index) => {

                      const itemQuantity =
                        Number(
                          item?.quantity || 1
                        );


                      const itemPrice =
                        Number(
                          item?.price || 0
                        );


                      const itemDiscount =
                        Number(
                          item?.discount || 0
                        );



                      const currency =
                        item?.currency ||
                        "NGN";


                      const symbol =
                        symbols[currency] ||
                        currency;


                      const rate =
                        exchangeRatesToUSD[
                          currency
                        ] ?? 1;

                      const itemSubtotal =
                        itemPrice *
                        itemQuantity;


                      const itemAfterDiscount =
                        Math.max(
                          itemSubtotal -
                          itemDiscount,
                          0
                        );


                      const priceUSD =
                        itemPrice *
                        rate;


                      const discountUSD =
                        itemDiscount *
                        rate;


                      const subtotalUSD =
                        itemAfterDiscount *
                        rate;


                      return (
                        <div
                          key={
                            item?.product_id ||
                            index
                          }
                          className="
                            border
                            rounded-xl
                            p-3
                            sm:p-4
                            flex
                            flex-col
                            sm:flex-row
                            gap-4
                          "
                        >

                      
                          <div className="shrink-0">

                            <img
                              src={
                                item?.image ||
                                "/placeholder.png"
                              }
                              alt={
                                item?.name ||
                                "Product"
                              }
                              className="
                                w-full
                                sm:w-24
                                h-24
                                rounded-lg
                                object-cover
                              "
                            />

                          </div>

                          <div className="flex-1 min-w-0">

                            {/* PRODUCT HEADER */}

                            <div
                              className="
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-start
                                sm:justify-between
                                gap-3
                              "
                            >

                              <div className="min-w-0">

                                <h4
                                  className="
                                    font-bold
                                    text-sm
                                    sm:text-base
                                  "
                                >
                                  {item?.name ||
                                    item?.title ||
                                    "Unnamed Product"}
                                </h4>


                                {/* DESCRIPTION */}

                                {item?.description && (
                                  <p
                                    className="
                                      text-xs
                                      sm:text-sm
                                      mt-1
                                      
                                      line-clamp-3
                                    "
                                  >
                                    {item.description}
                                  </p>
                                )}

                              </div>

                            </div>


                            <div
                              className="
                                flex
                                flex-wrap
                                gap-x-5
                                gap-y-2
                                mt-4
                                text-xs
                                sm:text-sm
                              "
                            >

                              {/* CURRENCY */}

                              <div>

                                <span className="">
                                  Currency:
                                </span>{" "}

                                <span className="font-semibold">
                                  {symbol}{" "}
                                  {currency}
                                </span>

                              </div>


                              {/* QUANTITY */}

                              <div>

                                <span className="">
                                  Quantity:
                                </span>{" "}

                                <span className="font-semibold">
                                  {itemQuantity}
                                </span>

                              </div>


                              {/* PRICE */}

                              <div>

                                <span className="">
                                  Price:
                                </span>{" "}

                                <span className="font-semibold">
                                  {symbol}
                                  {formatNumber(
                                    itemPrice
                                  )}
                                </span>

                              </div>


                              {/* DISCOUNT */}

                              {itemDiscount > 0 && (
                                <div>

                                  <span className="">
                                    Discount:
                                  </span>{" "}

                                  <span
                                    className="
                                      font-semibold
                                      text-red-500
                                    "
                                  >
                                    -{symbol}
                                    {formatNumber(
                                      itemDiscount
                                    )}
                                  </span>


                                </div>
                              )}


                              {/* SUBTOTAL */}

                              <div>

                                <span className="">
                                  Subtotal:
                                </span>{" "}

                                <span
                                  className="
                                    font-bold
                                    text-green-700
                                  "
                                >
                                  {symbol}
                                  {formatNumber(
                                    itemAfterDiscount
                                  )}
                                </span>

                                <span
                                  className="
                                    text-xs
                                    
                                    ml-1
                                  "
                                >
                                  ($
                                  {formatNumber(
                                    subtotalUSD
                                  )} USD)
                                </span>

                              </div>

                            </div>


                            {/* PRODUCT USD SUMMARY */}

                            <div
                              className="
                                mt-4
                                pt-3
                                border-t
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                gap-2
                              "
                            >

                              <span className="text-xs ">
                                USD equivalent
                              </span>

                              <span
                                className="
                                  text-sm
                                  font-bold
                                  text-green-700
                                "
                              >
                                ${formatNumber(
                                  subtotalUSD
                                )} USD
                              </span>

                            </div>

                          </div>

                        </div>
                      );

                    }
                  )}

                </div>

              </div>


              {/* =================================================
                  TOTAL BREAKDOWN
              ================================================== */}

              <div
                className="
                  border-t
                  mt-5
                  pt-5
                  space-y-3
                "
              >

                {/* SUBTOTAL */}

                <div
                  className="
                    flex
                    justify-between
                    items-center
                    gap-3
                    text-sm
                  "
                >

                  <span className="font-semibold">
                    Subtotal
                  </span>

                  <span className="font-bold">
                    ${formatNumber(
                      totalSubtotalUSD
                    )}
                  </span>

                </div>


                {/* DISCOUNT */}

                {totalDiscountUSD > 0 && (
                  <div
                    className="
                      flex
                      justify-between
                      items-center
                      gap-3
                      text-sm
                    "
                  >

                    <span className="font-semibold">
                      Discount
                    </span>

                    <span
                      className="
                        font-bold
                        text-red-500
                      "
                    >
                      -$
                      {formatNumber(
                        totalDiscountUSD
                      )}
                    </span>

                  </div>
                )}


                {/* DELIVERY */}

                {deliveryPrice > 0 && (
                  <div
                    className="
                      flex
                      justify-between
                      items-center
                      gap-3
                      text-sm
                    "
                  >

                    <span className="font-semibold">
                      Delivery
                    </span>

                    <span className="font-bold">
                      ${formatNumber(
                        deliveryUSD
                      )}
                    </span>

                  </div>
                )}


                {/* FINAL TOTAL */}

                <div
                  className="
                    border-t
                    pt-4
                    flex
                    justify-between
                    items-center
                    gap-3
                  "
                >

                  <div>

                    <p className="font-bold text-base sm:text-lg">
                      Total Price
                    </p>

                    <p className="text-xs  mt-1">
                      Converted to USD
                    </p>

                  </div>


                  <span
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-green-700
                      whitespace-nowrap
                    "
                  >
                    ${formatNumber(
                      finalTotalUSD
                    )}
                  </span>

                </div>

              </div>


              {/* =================================================
                  ORIGINAL CURRENCY NOTE
              ================================================== */}

              <div
                className="
                  mt-5
                  rounded-xl
                  bg-blue-50
                  dark:bg-blue-950/30
                  border
                  border-blue-200
                  dark:border-blue-900
                  p-3
                  text-xs
                  
                "
              >

                <p>
                  Product prices are displayed in their
                  original currency, with the USD equivalent
                  shown for reference.
                </p>

                <p className="mt-1">
                  Exchange rates used:
                  {" "}
                  1 USD = 1 USD,
                  {" "}
                  NGN is converted using the configured
                  NGN/USD rate,
                  {" "}
                  EUR is converted using the configured
                  EUR/USD rate.
                </p>

              </div>

            </>
          );

        })()}

      </div>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div
        className="
          border-t
          p-4
          flex
          justify-end
          gap-2
          shrink-0
        "
      >

        <button
          type="button"
          onClick={() => {
            setShowDraftDetails(false);
            setSelectedDraft(null);
          }}
          className="
            px-4
            py-2
            rounded-lg
            bg-gray-900
            hover:bg-gray-800
            text-white
            text-sm
            font-bold
            transition
          "
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}    {/* ================= EMPTY STATE ================= */}
    {drafts.length === 0 && (
      <div className="text-center text-[var(--text-color)] py-10 text-sm">
        No saved orders
      </div>
    )}

  </div>
)}
  </div>
);
}