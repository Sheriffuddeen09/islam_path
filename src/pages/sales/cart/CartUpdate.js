import React, { useState } from "react";
import axios from "axios";
import { apiFetchs } from "../Api/axios";

const UpdateCart = () => {
  const [userId, setUserId] = useState(0); // Default to 0, can be changed
  const [responseMessage, setResponseMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showModal, setShowModal] = useState(false); // Manage modal visibility

  const handleChange = (e) => {
    setUserId(e.target.value);
  };

  const closeModal = () => {
    setShowModal(false);
    setResponseMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cartData = { user: userId };

    try {
      const response = await apiFetchs.put(
        "/cart/",
        cartData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setUserId(response.data)
      setResponseMessage("Cart updated successfully!");
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to update cart."
      );
      setResponseMessage(null);
    } finally {
      setShowModal(true);
    }
  };

  return (
    <div className="container my-5">
      <form onSubmit={handleSubmit} className="form-inline">
        <div className="form-group mb-3">
          <label htmlFor="userId" className="form-label me-2">
            User ID:
          </label>
          <input
            id="userId"
            type="number"
            value={userId}
            onChange={handleChange}
            required
            className="form-control"
            style={{ maxWidth: "200px" }}
          />
        </div>
        <button type="submit" className="btn btn-primary ms-2">
          Update Cart
        </button>
      </form>

      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cart Update Status</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {responseMessage && (
                  <p style={{ color: "green" }}>{responseMessage}</p>
                )}
                {errorMessage && (
                  <p style={{ color: "red" }}>{errorMessage}</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateCart;