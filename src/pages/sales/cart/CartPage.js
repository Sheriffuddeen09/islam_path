import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../Api/axios";
import CartDelete from "./CartDelete";
import CheckoutModal from "./CheckoutPage";


const ReadMore = ({ text, maxWords = 12 }) => {
  const words = text.split(" ");
  const [isExpanded, setIsExpanded] = useState(false);
  if (words.length <= maxWords) return <span>{text}</span>;
  return (
    <span>
      {isExpanded ? text : words.slice(0, maxWords).join(" ") + "... "}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:underline ml-1 text-xs"
      >
        {isExpanded ? "Read less" : "Read more"}
      </button>
    </span>
  );
};

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);


  // FETCH CART
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/cart");
      setCart(res.data.cart || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return;

    const newCart = cart.map((c) =>
      c.id === item.id ? { ...c, quantity } : c
    );
    setCart(newCart);

    try {
      await api.put(`/api/cart/${item.id}`, { quantity });
    } catch (err) {
      console.error(err);
      // Rollback if API fails
      setCart(cart);
    }
  };

  // REMOVE ITEM
  const handleRemoveItem = (updatedCart) => {
    setCart(updatedCart.cart);
  };

  // CALCULATE TOTAL
  const calculateTotalPrice = () => {
    return cart.reduce(
      (total, item) =>
        total + (parseFloat(item.product.price) || 0) * item.quantity,
      0
    );
  };

  return (
    <section className="cart py-10 px-2 md:px-4 lg:px-6">
      {loading ? (
        <div className="flex flex-col gap-4 mt-14 animate-pulse">
          {[...Array(3)].map((_, idx) => (
            <>
            <div key={idx} className="h-24 bg-gray-200 rounded-lg" />
            <div key={idx} className="h-10 bg-gray-200 rounded-lg" />
            <div key={idx} className="h-6 bg-gray-200 rounded-lg" />
            </>
          ))}
        </div>
      ) : cart.length > 0 ? (
        <div className="flex flex-col mt-14 lg:flex-row gap-8">
          {/* LEFT TABLE / CARDS */}
          <div className="flex-1">
            <div className="bg-white shadow-md rounded-lg py-3 md:p-6 border-blue-800 rounded border-t-2 sm:border-b-2 ">
              <h1 className="text-xl font-semibold mb-4 text-black text-center font-bold">🛒 Cart Products</h1>
              
              {/* TABLE FOR LARGE SCREENS */}
              <div className="overflow-x-auto sm:w-full w-80 no-scrollbar mx-auto border-gray-800 rounded border-b-2 sm:border-0 shadow-md">
                <table className="min-w-full text-left">
                  <thead className="bg-white text-black border-b-2 border-gray-800 rounded my-2 py-3">
                    <tr>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Delete</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Product Image</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Title</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Price</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Product Description</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Quantity</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id} className="border-b py-2 my-3 text-black">
                        <td className="px-4 py-2">
                          <CartDelete
                            cartId={item.id}
                            handleRemoveItem={handleRemoveItem}
                          />
                        </td>
                        <td className="flex gap-2 px-4 py-2">
                          <img
                            src={
                              item.product.images?.[0]?.image_path
                                ? `http://localhost:8000/storage/${item.product.images[0].image_path}`
                                : "/placeholder.png"
                            }
                            alt={item.product.title}
                            className="w-full object-cover rounded"
                          />
                        </td>

                        <td className="px-4 py-2 text-sm font-semibold">
                         {item.product.title}
                        </td>
                        <td className="px-4 py-2">
                          ₦{(parseFloat(item.product.price) || 0).toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-xs font-semibold">
                          <ReadMore
                            text={item.product.description || "No description"}
                            maxWords={12}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item, item.quantity - 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              min={1}
                              onChange={(e) =>
                                updateQuantity(item, parseInt(e.target.value))
                              }
                              className="w-12 text-center border rounded"
                            />
                            <button
                              onClick={() =>
                                updateQuantity(item, item.quantity + 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          ₦
                          {(
                            (parseFloat(item.product.price) || 0) *
                            item.quantity
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-full lg:w-1/3">
  <div className="bg-white shadow border-blue-800 rounded sm:border-t-2 border-b-2 text-black rounded-lg p-6 md:p-8">
    <h2 className="text-xl font-semibold mb-4">Cart Totals</h2>

    <div className="bg-gray-50 rounded p-4 mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-bold">Subtotal</span>
        <span>
          ₦{calculateTotalPrice().toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between mb-2 capitalize">
        <span className="text-sm font-bold"> Delivery Method</span>
        <span>
          {cart.length > 0
            ? [...new Set(cart.map(item => item.product.delivery_method.replace("_", " ")))].join(", ")
            : "Pick Up Station"}
        </span>
      </div>

      <div className="flex justify-between mb-2">
        <span className="text-sm font-bold">Estimated Delivery</span>
        <span>
          ₦{cart.length > 0 ? cart.reduce((sum, item) => sum + (item.product.delivery_price || 0), 0) : "No Payment"}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-sm font-bold">Estimated Discount</span>
        <span>
          ₦{cart.length > 0 ? cart.reduce((sum, item) => sum + (item.product.discount || 0), 0) : "No Discount Available"}
        </span>
      </div>
    </div>

    <div className="bg-gray-50 rounded p-4 mb-4 font-bold flex justify-between">
      <span>Total</span>
      <span>
        ₦{cart.length > 0
          ? (cart.reduce((sum, item) => sum + ((item.product.price || 0) * item.quantity), 0)
             + cart.reduce((sum, item) => sum + (item.product.delivery_price || 0), 0)
             - cart.reduce((sum, item) => sum + (item.product.discount || 0), 0)
            ).toFixed(2)
          : 0}
      </span>
    </div>


    <button
      onClick={() => setCheckoutOpen(true)}
      className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
    >
      Proceed to Checkout
    </button>
  </div>
</div>
        </div>
      ) : (

    <p className="text-center text-black flex justify-center items-center flex-col text-xl font-bold mt-40 gap-4">
      🛒 Your cart is empty
      <Link
        to="/online-sale"
        className="mt-2 text-blue-600 hover:underline text-lg font-semibold"
      >
        Go to Shop
      </Link>
    </p>
      )}

      <CheckoutModal
        open={checkoutOpen}
        setOpen={setCheckoutOpen}
        cart={cart}
      />
    </section>
  );
};

export default CartPage;