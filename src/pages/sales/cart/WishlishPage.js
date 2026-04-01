import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import api from "../../../Api/axios";
import CartDelete from "./CartDelete";
import Toast from "../../../notification/Toast"
import CheckoutModal from "./CheckoutPage";

// ReadMore component replace
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

const WishlistPage = ({savedCount, setSavedCount}) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  

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
const [loadingItems, setLoadingItems] = useState({}); 
const [loadingMove, setLoadingMove] = useState({}); 

const updateQuantity = async (item, quantity) => {
  if (quantity < 1) return;
  try {
    setLoadingItems((prev) => ({ ...prev, [item.id]: "quantity" }));
    const res = await api.put(`/api/wishlist/${item.id}`, { quantity });
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
    setLoadingMove((prev) => ({ ...prev, [item.id]: "cart" }));
    const res = await api.post(`/api/wishlist/move-to-cart/${item.id}`, {
      quantity: item.quantity,
    });
    setWishlist(res.data.wishlist);
    setToastMessage("Item moved to cart ✅");
    setTimeout(() => setToastMessage(""), 3000);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingMove((prev) => ({ ...prev, [item.id]: null }));
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
    <section className="wishlist py-10 px-4 md:px-4 lg:px-6">
      {loading ? (
        <div className="flex flex-col gap-4 mt-14 animate-pulse">
         {[...Array(2)].map((_, idx) => (
            <>
                <div className="flex flex-row flex-wrap gap-3 px-5 w-full">
                  <div className="w-full flex-1">
                    <div key={idx} className="h-24 mb-1 bg-gray-200 rounded-lg" />
                    <div key={idx} className="h-12 mb-1 bg-gray-200 rounded-lg" />
                    <div key={idx} className="h-8 mb-1 bg-gray-200 rounded-lg" />
                    <div key={idx} className="h-6 mb-1 bg-gray-200 rounded-lg" />
                    <div key={idx} className="h-3 mb-1 bg-gray-200 rounded-lg" />
                  </div>

                  <div className="w-80">
                    <div key={idx} className="h-24 mb-1 bg-gray-200 rounded-lg" />
                    <div key={idx} className="h-12 mb-1 bg-gray-200 rounded-lg" />
                    <div key={idx} className="h-8 mb-1 bg-gray-200 rounded-lg" />
                    <div key={idx} className="h-6 mb-1 bg-gray-200 rounded-lg" />
                    <div key={idx} className="h-3 mb-1 bg-gray-200 rounded-lg" />
                  </div>
                </div>

            </>
          ))}
        </div>
      ) : wishlist.length > 0 ? (
        <div className="flex flex-col mt-14 lg:flex-row gap-6">
          {/* LEFT TABLE / CARDS */}
          <div className="flex-1">
            <div className="bg-white shadow-md rounded-lg py-3 md:p-6 border-green-800 rounded border-t-2 sm:border-b-2 ">
              <h1 className="text-xl font-semibold mb-4 text-black text-center font-bold">🛒 Wishlist Products</h1>
            

              {/* TABLE FOR LARGE SCREENS */}
               <div className="overflow-x-auto sm:w-full w-80 no-scrollbar mx-auto border-orange-800 rounded border-b-2 sm:border-0 shadow-md">
                <table className="min-w-full text-left">
                  <thead className="bg-white text-black border-b-2 border-orange-800 rounded my-2 py-3">
                    <tr>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Delete</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Product Image</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Title</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Price</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Product Description</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Quantity</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">Subtotal</th>
                      <th className="px-4 py-4 whitespace-nowrap text-sm">To Cart</th>
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
                            className="w-28 h-28 object-cover rounded"
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
                                -
                                </button>
                            {/* <input
                              type="number"
                              value={item.quantity}
                              min={1}
                              onChange={(e) =>
                                updateQuantity(item, parseInt(e.target.value))
                              }
                              className="w-12 text-center border rounded"
                            /> */}
                            <button
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            disabled={loadingItems[item.id] === "quantity"}
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
                        <td className="px-4 py-2">
                          <button
                          onClick={() => moveToCart(item)}
                          className="bg-blue-600 text-white text-sm px-2 py-2 rounded hover:bg-blue-700 mt-2"
                          disabled={loadingMove[item.id] === "cart"}>
                          {loadingMove[item.id] === "cart" ?
                          <p className="inline-flex items-center gap-2"> 
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" /> 
                          Add
                          </p>
                          : <p className="inline-flex items-center gap-2"> 
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                          </svg>
                          Add </p>}
                        </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-full lg:w-96">
            <div className="bg-white shadow border-green-800 rounded sm:border-t-2 border-b-2 text-black rounded-lg p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4">Wishlist Totals</h2>
          
              <div className="bg-gray-50 rounded p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold">Subtotal</span>
                <span className="text-xs font-semibold">
                  ₦{calculateTotalPrice().toFixed(2)}
                </span>
              </div>

      <div className="flex justify-between mb-2 capitalize">
        <span className="text-sm font-bold"> Delivery Method</span>
        <span className="text-xs font-semibold">
          {wishlist.length > 0
            ? [...new Set(wishlist.map(item => item.product.delivery_method?.replace("_", " ")))].join(", ")
            : "Pick Up Station"}
        </span>
      </div>


      <div className="flex justify-between">
        <span className="text-sm font-bold">Estimated Discount</span>
        <span className="text-xs font-semibold">
          ₦{wishlist.length > 0 ? wishlist.reduce((sum, item) => sum + (item.product.discount || 0), 0) : "No Discount Available"}
        </span>
      </div>
    </div>
          
              <div className="bg-gray-50 rounded p-4 mb-4 font-bold flex justify-between">
                <span>Total</span>
                <span>
                  ₦{wishlist.length > 0
                    ? (wishlist.reduce((sum, item) => sum + ((item.product.price || 0) * item.quantity), 0)
                       + wishlist.reduce((sum, item) => sum + (item.product.delivery_price || 0), 0)
                       - wishlist.reduce((sum, item) => sum + (item.product.discount || 0), 0)
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
        <p className="text-center text-black flex justify-center items-center flex-col text-xl font-bold mt-40">
          🛒 Your wishlist is empty
          <Link to="/shop" className="text-blue-600 hover:underline mt-4">
            Go to Shop
          </Link>
        </p>
      )}

      {toastMessage && <Toast show={true} message={toastMessage} />}

       <CheckoutModal
          open={checkoutOpen}
          setOpen={setCheckoutOpen}
          cart={wishlist}
          savedCount={savedCount} setSavedCount={setSavedCount}
        />
    </section>
  );
};

export default WishlistPage;