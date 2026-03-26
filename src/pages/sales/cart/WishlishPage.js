import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../../../Api/axios";
import CartDelete from "./CartDelete";
import Toast from "./Toast";

// ReadMore component
const ReadMore = ({ text, maxWords = 8 }) => {
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

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // FETCH WISHLIST
  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/wishlist");
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  // UPDATE QUANTITY
  // Inside WishlistPage component
const [loadingItems, setLoadingItems] = useState({}); // Track loading per item

// UPDATE QUANTITY with loading
const updateQuantity = async (item, quantity) => {
  if (quantity < 1) return;
  try {
    setLoadingItems((prev) => ({ ...prev, [item.id]: "quantity" }));
    const res = await api.put(`/wishlist/${item.id}`, { quantity });
    setWishlist(res.data.wishlist);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingItems((prev) => ({ ...prev, [item.id]: null }));
  }
};

// MOVE TO CART with loading
const moveToCart = async (item) => {
  try {
    setLoadingItems((prev) => ({ ...prev, [item.id]: "cart" }));
    const res = await api.post(`/wishlist/move-to-cart/${item.id}`, {
      quantity: item.quantity,
    });
    setWishlist(res.data.wishlist);
    setToastMessage("Item moved to cart ✅");
    setTimeout(() => setToastMessage(""), 3000);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingItems((prev) => ({ ...prev, [item.id]: null }));
  }
};

  // REMOVE ITEM
  const handleRemoveItem = (updatedWishlist) => {
    setWishlist(updatedWishlist.wishlist);
    setToastMessage("Item removed from wishlist 🛒");
    setTimeout(() => setToastMessage(""), 3000);
  };


  // CALCULATE TOTAL PRICE
  const calculateTotalPrice = () => {
    return wishlist.reduce(
      (total, item) => total + (parseFloat(item.product.price) || 0) * item.quantity,
      0
    );
  };

  return (
    <section className="wishlist py-10 px-4 md:px-8 lg:px-16">
      {loading ? (
        <div className="flex flex-col gap-4 mt-14 animate-pulse">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="flex flex-col mt-14 lg:flex-row gap-8">
          {/* LEFT TABLE / CARDS */}
          <div className="flex-1">
            <div className="bg-white shadow rounded-lg p-4 md:p-6">
              <h1 className="text-xl font-semibold mb-4 text-black text-center font-bold">
                Wishlist
              </h1>

              {/* TABLE FOR LARGE SCREENS */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-4">Delete</th>
                      <th className="px-4 py-4">Product</th>
                      <th className="px-4 py-4">Price</th>
                      <th className="px-4 py-4">Description</th>
                      <th className="px-4 py-4">Quantity</th>
                      <th className="px-4 py-4">Subtotal</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlist.map((item) => (
                      <tr key={item.id} className="border-b text-black">
                        <td className="px-4 py-2">
                          <CartDelete
                            cartId={item.id}
                            handleRemoveItem={handleRemoveItem}
                          />
                        </td>
                        <td className="flex items-center gap-2 px-4 py-2">
                          <img
                            src={
                              item.product.images?.[0]?.image_path
                                ? `http://localhost:8000/storage/${item.product.images[0].image_path}`
                                : "/placeholder.png"
                            }
                            alt={item.product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          {item.product.title}
                        </td>
                        <td className="px-4 py-2">
                          ₦{(parseFloat(item.product.price) || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <ReadMore
                            text={item.product.description || "No description"}
                            maxWords={10}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                disabled={loadingItems[item.id] === "quantity"}
                                >
                                {loadingItems[item.id] === "quantity" ? <Loader2 className="w-4 h-4 animate-spin" /> : "-"}
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
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            disabled={loadingItems[item.id] === "quantity"}
                            >
                            {loadingItems[item.id] === "quantity" ? <Loader2 className="w-4 h-4 animate-spin" /> : "+"}
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
                        <td className="px-4 py-2">
                          <button
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            disabled={loadingItems[item.id] === "quantity"}
                            >
                            {loadingItems[item.id] === "quantity" ? <Loader2 className="w-4 h-4 animate-spin" /> : "+"}
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="lg:hidden flex flex-col gap-4">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 shadow flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            item.product.images?.[0]?.image_path
                              ? `http://localhost:8000/storage/${item.product.images[0].image_path}`
                              : "/placeholder.png"
                          }
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold">{item.product.title}</p>
                          <ReadMore
                            text={item.product.description || "No description"}
                            maxWords={10}
                          />
                        </div>
                      </div>
                      <CartDelete
                        cartId={item.id}
                        handleRemoveItem={handleRemoveItem}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>
                        ₦{(parseFloat(item.product.price) || 0).toFixed(2)}
                      </span>
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
                      <span>
                        ₦
                        {(
                          (parseFloat(item.product.price) || 0) *
                          item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => moveToCart(item)}
                      className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 mt-2"
                    >
                      Move to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white shadow rounded-lg p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4">Wishlist Totals</h2>

              <div className="bg-gray-50 rounded p-4 mb-4 flex justify-between">
                <span>Total Items</span>
                <span>{wishlist.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="bg-gray-50 rounded p-4 mb-4 flex justify-between font-bold">
                <span>Total Price</span>
                <span>₦{calculateTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-black flex justify-center items-center flex-col text-xl font-bold mt-40">
          🛒 Your wishlist is empty
          <Link to="/shop" className="text-blue-600 hover:underline mt-4">
            Go to Shop
          </Link>
        </p>
      )}

      {toastMessage && <Toast show={true} message={toastMessage} />}
    </section>
  );
};

export default WishlistPage;