import { createContext, useContext, useState } from "react";
import Notification from "../../../Form/Notification";
import api from "../../../Api/axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false); // ✅ Loading state

  const showNotification = (message, type = "success") => {
    setNotify({ message, type });

    // Clear after 5 seconds
    setTimeout(() => {
      setNotify({ message: "", type: "" });
    }, 5000);
  };

  const addToCart = async (product) => {
    if (product.stock <= 0) return; // prevent adding out-of-stock items

    try {
      setLoading(true); // start loading
      const res = await api.post("/api/cart", {
        product_id: product.id,
        quantity: 1,
      });

      setCart(res.data.cart);
      showNotification("Product added to cart", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to add product to cart", "error");
    } finally {
      setLoading(false); // stop loading
    }
  };

  const content = (
    <CartContext.Provider value={{ cart, addToCart, loading }}>
      {children}
    </CartContext.Provider>
  );

  return (
    <div>
      {content}
      {notify.message && (
        <Notification
          message={notify.message}
          type={notify.type}
          onClose={() => setNotify({ message: "", type: "" })}
        />
      )}
    </div>
  );
};

export const useCart = () => useContext(CartContext);