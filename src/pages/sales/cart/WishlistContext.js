import React, { createContext, useContext, useState} from "react";
import api from "../../../Api/axios";
import Notification from "../../../notification/Notification";
import { useAuth } from "../../../layout/AuthProvider";


const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [notify, setNotify] = useState({ message: "", type: "" });
  const [loadingId, setLoadingId] = useState(null); // ✅ Loading state

  const authUser = useAuth()
  
    const showNotification = (message, type = "success") => {
      setNotify({ message, type });
  
      // Clear after 5 seconds
      setTimeout(() => {
        setNotify({ message: "", type: "" });
      }, 5000);
    };
  
    const addToWishlist = async (product) => {

      if (product.user_id === authUser?.id) {
        showNotification("You cannot buy your own product", "error");
        return;
      }

      if (product.stock <= 0) return; 
  
      try {
        setLoadingId(product.id); // start loading
        const res = await api.post("/api/wishlist", {
          product_id: product.id,
          quantity: 1,
        });
  
        setWishlist(res.data.wishlist);
        showNotification("Product added to Wishlist", "success");
      } catch (err) {
        console.error(err);
        showNotification("Failed to add product to Wishlist", "error");
      } finally {
        setLoadingId(false); // stop loading
      }
    };



  const content = (
    <WishlistContext.Provider
      value={{
        loadingId,
        addToWishlist,
        wishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
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

export const useWishlist = () => useContext(WishlistContext);