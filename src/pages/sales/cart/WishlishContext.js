import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../../../Api/axios";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const addToWishlist = async (product_id, quantity = 1) => {
    try {
      const res = await api.post("/wishlist", { product_id, quantity });
      setWishlist(res.data.wishlist);
    } catch (err) {
      console.error(err);
    }
  };



  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);