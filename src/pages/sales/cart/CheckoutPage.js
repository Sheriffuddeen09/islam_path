import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../../../Api/axios";
import PaymentStep from "../order/OrderSteps";
import {useAuth} from './../../../layout/AuthProvider'

const CheckoutModal = ({ open, setOpen, cart }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {user} = useAuth()

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    addressSecond: "",
    city: "",
    state: "",
    zip: "",
    payment_method: "cod",
  });

  // ✅ AUTO-FILL USER
  useEffect(() => {
    if (open) {
      api.get("/api/user").then((res) => {
        const user = res.data;
        setForm((prev) => ({
          ...prev,
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          addressSecond: user.addressSecond || "",
          state: user.state || "",
          zip: user.zip || "",
        }));
      });
    }
  }, [open]);

  
  // ✅ TOTALS
  const subtotal = cart.reduce(
    (t, i) => t + i.product.price * i.quantity,
    0
  );

  const delivery = cart.reduce(
    (t, i) => t + (i.product.delivery_price || 0),
    0
  );

  const discount = cart.reduce(
    (t, i) => t + (i.product.discount || 0),
    0
  );

  const total = subtotal + delivery - discount;

  // ✅ ORDER

  const orderData = {
  user_id: user?.id, // ✅ from API user

  first_name: form.first_name,
  last_name: form.last_name,
  email: form.email,
  phone: form.phone,

  address: form.address,
  city: form.city,
  state: form.state,
  zip: form.zip,

  payment_method: form.payment_method,

  // ✅ CALCULATIONS
  subtotal: cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  ),

  delivery_price: 1500, // ✅ you can change or make dynamic
  discount: 0,

  total_price:
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0) +
    1500,

  // ✅ ITEMS
  items: cart.map((item) => ({
    product_id: item.id,
    name: item.title,
    price: item.price,
    quantity: item.quantity,
  })),
};

  const handleCheckout = async () => {
    try {
      setLoading(true);

      await api.post("/api/checkout", {
        ...form,
        cart,
      });

      alert("✅ Order placed successfully");
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="overflow-y-auto h-[560px] sm:h-[600px] no-scrollbar w-[95%] max-w-3xl rounded-xl shadow-lg sm:p-6 relative">

        {/* CLOSE */}
        <button onClick={() => setOpen(false)} className="absolute text-black sm:right-28 right-4 rounded-full sm:top-8 top-4">
          <X />
        </button>

        {step === 1 && (
        <div className="bg-white w-full max-w-xl mx-auto rounded-2xl shadow-xl p-6">

            <h2 className="text-xl font-bold mb-6 text-gray-800">
            User Information
            </h2>

            <div className="space-y-4">

            {/* FULL NAME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
                <label className="block text-sm text-black font-semibold mb-1">
                First Name
                </label>
                <input
                type="text"
                placeholder="John Doe"
                value={`${form.first_name}`}
                onChange={(e) => {
                    const value = e.target.value.split(" ");
                    setForm({
                    ...form,
                    first_name: value[0] || "",
                    });
                }}
                className="w-full border text-black border-gray-200 shadow rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm text-black font-semibold mb-1">
                Last Name
                </label>
                <input
                type="text"
                placeholder="John Doe"
                value={`${form.last_name}`}
                onChange={(e) => {
                    const value = e.target.value.split(" ");
                    setForm({
                    ...form,
                    last_name: value.slice(1).join(" ") || "",
                    });
                }}
                className="w-full border text-black border-gray-200 shadow rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            </div>

            {/* PHONE */}
            <div>
                <label className="block text-sm text-black font-semibold mb-1">
                Phone Number
                </label>
                <input
                type="text"
                placeholder="+234 801 234 5678"
                value={form.phone}
                onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                }
                className="w-full border text-black border-gray-200 shadow rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* GOOGLE ADDRESS PICKER */}
            <div>
                <label className="block text-sm text-black font-semibold mb-1">
                Address Line 1
                </label>
                    <input
                    type="text"
                    placeholder="Apartment, suite, Address Line 1"
                    value={form.address}
                    onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                    }
                    className="w-full border text-black border-gray-200 shadow rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
               
            </div>

            {/* ADDRESS LINE 2 */}
            <div>
                <label className="block text-sm text-black font-semibold mb-1">
                Street Address Line 2 (Optional)
                </label>
                <input
                type="text"
                placeholder="Apartment, suite, Address Line 2."
                onChange={(e) =>
                    setForm({ ...form, addressSecond: e.target.value })
                }
                className="w-full border text-black border-gray-200 shadow rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* CITY + STATE */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm text-black font-semibold mb-1">
                    Country
                </label>
                <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                    }
                    className="w-full border text-black border-gray-200 shadow rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                </div>

                <div>
                <label className="block text-sm text-black font-semibold mb-1">
                    State / City
                </label>
                <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                    setForm({ ...form, state: e.target.value })
                    }
                    className="w-full border text-black border-gray-200 shadow rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                </div>
            </div>

            {/* COUNTRY + ZIP */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm text-black font-semibold mb-1">
                    ZIP Code
                </label>
                <input
                    type="text"
                    value={form.zip}
                    onChange={(e) =>
                    setForm({ ...form, zip: e.target.value })
                    }
                    className="w-full border text-black border-gray-200 shadow rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                </div>
            </div>

            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-6">
            <button
                onClick={() => setOpen(false)}
                className="w-full bg-gray-500 hover:bg-gray-300 py-2 rounded-lg"
            >
                Cancel
            </button>

            <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
                Continue
            </button>
            </div>
        </div>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <>
          <div className="bg-white text-black w-full max-w-xl mx-auto rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 mb-4 p-3 border rounded shadow border-gray-200 shadow-b pb-2">
                  <img
                    src={`http://localhost:8000/storage/${item.product.images[0]?.image_path}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-2">{item.product.title}</p>
                    <p className="font-semibold text-sm mb-2">Quantity: {item.quantity}</p>
                    <p className="font-semibold text-sm mb-2">Price: ₦{item.product.price}</p>
                    <p className="font-semibold text-sm">{item.product.description}</p>

                  </div>
                </div>
              ))}
            </div>

           <div className="space-y-2 text-sm text-gray-600">
    <div className="flex justify-between">
      <span>Subtotal</span>
      <span className="font-medium text-gray-800">₦{subtotal}</span>
    </div>

    <div className="flex justify-between">
      <span>Delivery Fee</span>
      <span className="text-gray-800">₦{delivery}</span>
    </div>

    <div className="flex justify-between">
      <span>Discount</span>
      <span className="text-green-600">-₦{discount}</span>
    </div>

    <div className="border-t pt-3 flex justify-between font-semibold text-gray-900 text-base">
      <span>Total</span>
      <span>₦{total}</span>
    </div>
  </div>

  {/* 🚚 DELIVERY INFO */}
  <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
    <h4 className="text-sm font-semibold text-gray-800 mb-2">
      Deliver To
    </h4>

    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">

  {/* HEADER */}
  <div className="flex items-center justify-between mb-3">
    <h4 className="text-sm font-semibold text-gray-800">
      Delivery Address
    </h4>

    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
      Default
    </span>
  </div>

  {/* USER NAME */}
  <p className="font-semibold text-gray-900 mb-2 text-sm">
    {form.first_name} {form.last_name}
  </p>

  {/* PHONE */}
  <div className="flex items-center my-2 gap-2 text-gray-600 text-sm mt-1">
    <span>📞</span>
    <span>{form.phone}</span>
  </div>

  {/* ADDRESS */}
  <div className="flex items-start gap-2 text-gray-600 text-sm mt-2">
    {(form.address) && (
    <span>📍</span>
     )}
    <div>
      <p>{form.address}</p>
      <p>{form.addressSecond}</p>

      {(form.city || form.state) && (
        <p className="text-gray-500 my-1">
          {form.city}, {form.state}
        </p>
      )}

      {form.zip && (
        <p className="text-gray-400 text-sm">
          ZIP: {form.zip}
        </p>
      )}
    </div>
  </div>

</div>
  </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="bg-gray-200 px-4 py-2 rounded">
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                Continue
              </button>
            </div>
            </div>
          </>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <>
            <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl p-8 mt-6">

            <PaymentStep form={form} setForm={setForm} orderData={orderData} setStep={setStep} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;