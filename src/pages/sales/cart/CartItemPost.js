import React, { useState } from "react";
import { Form, Button, Alert, Spinner, Modal } from "react-bootstrap";
import { apiFetchs } from "../Api/axios"; // Adjust import based on your API setup

const CartItemForm = () => {
  const [cartId, setCartId] = useState(""); // Cart ID
  const [productId, setProductId] = useState(""); // Product UUID
  const [quantity, setQuantity] = useState(1); // Quantity
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false); // To control modal visibility

  // Function to create a new cart
  const createNewCart = async () => {
    try {
      const response = await apiFetchs.get("/cart/", {}); // Assuming the endpoint to create a cart
      return response.data.id; // Return the new cart ID
    } catch (err) {
      throw new Error("Failed to create a new cart.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    let currentCartId = cartId.trim();

    try {
      // If cart ID is not provided, create a new cart
      if (!currentCartId) {
        currentCartId = await createNewCart();
        setCartId(currentCartId); // Update the state with the new cart ID
        console.log("New cart created with ID:", currentCartId);
      }

      // Prepare the payload
      const payload = {
        cart: parseInt(currentCartId, 10),
        product: productId.trim(),
        quantity: parseInt(quantity, 10),
      };

      console.log("Payload being sent to server:", payload);

      // Add the product to the cart
      const response = await apiFetchs.post("/cart/items/", payload);
      setSuccess("Item added to cart successfully!");
      console.log("Server response:", response.data);

      
      setCartId('')
      setQuantity('')
      setProductId('')


    } catch (err) {
      console.error("Error from server:", err.response?.data || err.message);

      // Parse error details for debugging
      const errorDetails = err.response?.data || { message: "Unknown error occurred" };
      setError(
        `Failed to add item to cart. Server response: ${JSON.stringify(errorDetails)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Button variant="primary" onClick={() => setShowModal(true)}>
        Add Product
      </Button>
      {/* Display success or error message */}
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Product to Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Form for adding a cart item */}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Cart ID</Form.Label>
              <Form.Control
                type="text"
                value={cartId}
                onChange={(e) => setCartId(e.target.value)}
                placeholder="Enter Cart ID (Leave blank to create a new cart)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product UUID</Form.Label>
              <Form.Control
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product UUID"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter Quantity"
                min={1}
              />
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Add to Cart"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CartItemForm;