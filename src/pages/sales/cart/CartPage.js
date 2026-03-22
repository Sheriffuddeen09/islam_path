import Cart from "./Cart";

const CartPage = ({cart, setCart, loading}) => {
  
  // Function to calculate the total number of items in the cart (including quantities)
  const getCartItemCount = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const increaseQuantity = (itemId) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );
      return { ...prevCart, items: updatedItems };
    });
  };

  const decreaseQuantity = (itemId) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      return { ...prevCart, items: updatedItems };
    });
  };

  return (
    <>
    
     
      {/* CartSection */}
      <Cart
        cart={cart}
        increaseQuantity={increaseQuantity}
        loading={loading}
        decreaseQuantity={decreaseQuantity}
        setCart={setCart}
      />

      {/* BottomFooter */}
    </>
  );
};

export default CartPage;