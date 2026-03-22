import React from "react";
import { Link } from "react-router-dom";
import CartDeleteId from "./CartItemIdDelete";
import { Spinner } from "react-bootstrap";

const Cart = ({ cart, decreaseQuantity, increaseQuantity, setCart, loading }) => {
  const calculateTotalPrice = () => {
    return cart.items.reduce(
      (total, item) =>
        total + (parseFloat(item.product_detail.price) || 0) * item.quantity,
      0
    );
  };

  const handleRemoveItem = (itemId) => {
    const updatedCart = {
      ...cart,
      items: cart.items.filter((item) => item.id !== itemId),
    };
    setCart(updatedCart);
  };

  const content = (
    <section className="cart py-80">
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : Array.isArray(cart.items) && cart.items.length > 0 ? (
        <div>
          <div className="container">
            <div className="row gy-4">
              {/* Cart Items */}
              <div className="col-lg-8 col-md-12">
                <div className="cart-table border border-gray-100 rounded-8 px-40 py-48">
                  <h1 style={{ fontSize: "20px" }}>Cart Products</h1>
                  <div className="table-responsive">
                    <table className="table style-three">
                      <thead>
                        <tr>
                          <th>Delete</th>
                          <th>Product Name</th>
                          <th>Price</th>
                          <th>Description</th>
                          <th>Quantity</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <CartDeleteId cartId={item.id} handleRemoveItem={handleRemoveItem} />
                              <br />
                            </td>
                            <td>
                              {item.product_detail.resources && (
                                <img
                                  src={
                                    item.product_detail.resources[0]?.media_url || ""
                                  }
                                  alt={item.product_detail.name}
                                  style={{
                                    maxWidth: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              {item.product_detail.name}
                            </td>
                            <td>${(parseFloat(item.product_detail.price) || 0).toFixed(2)}</td>
                            <td>{item.product_detail.description}</td>
                            <td>
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                className="btn btn-secondary btn-sm"
                              >
                                -
                              </button>
                              <span className="mx-2">{item.quantity}</span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="btn btn-secondary btn-sm"
                              >
                                +
                              </button>
                            </td>
                            <td>
                              $$
                              {(
                                (parseFloat(item.product_detail.price) || 0) *
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

              {/* Cart Totals */}
              <div className="col-lg-4 col-md-12">
                <div className="cart-sidebar border border-gray-100 rounded-8 px-24 py-40">
                  <h6 className="text-xl mb-32">Cart Totals</h6>
                  <div className="bg-light rounded-8 p-24">
                    <div className="mb-32 d-flex justify-content-between">
                      <span>Subtotal</span>
                      <span>${calculateTotalPrice().toFixed(2)}</span>
                    </div>
                    <div className="mb-32 d-flex justify-content-between">
                      <span>Estimated Delivery</span>
                      <span>Free</span>
                    </div>
                    <div className="mb-0 d-flex justify-content-between">
                      <span>Estimated Tax</span>
                      <span>$10.00</span>
                    </div>
                  </div>
                  <div className="bg-light rounded-8 p-24 mt-24">
                    <div className="d-flex justify-content-between">
                      <span>Total</span>
                      <span>${(calculateTotalPrice() + 10).toFixed(2)}</span>
                    </div>
                  </div>
                  <Link
                    to="/orders"
                    className="btn btn-primary mt-40 w-100 rounded-8"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </section>
  );

  return (
    <section>
      <h1 style={{ textAlign: "start", margin: 0 }}></h1>
      {content}
    </section>
  );
};

export default Cart;