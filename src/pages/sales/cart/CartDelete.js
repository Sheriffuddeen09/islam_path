import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { apiFetchs } from "../Api/axios";

const CartDeleteId = ({ cartId, handleRemoveItem }) => {
  const [showModal, setShowModal] = useState(false); // State to control modal visibility


  const handleDelete = async () => {
    try {
      const response = await apiFetchs.delete(`/cart/items/${cartId}/`);
      console.log("Item deleted successfully");
      handleRemoveItem(response.data)
    } catch (error) {
      console.error("Failed to delete item:", error.message);
    }
  };

  return (
    <>
      {/* Button that triggers the confirmation modal */}
      <div className="delete-button-wrapper">
        <Button style={{ backgroundColor: "transparent", border:"none" }} onClick={() => setShowModal(true)}>
          <div className="" title="Delete Reply">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
              style={{ width: "18px", height: "18px", color: "black" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.74 9L14.394 18m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166M4.772 5.79a48.108 48.108 0 0 0-3.478-.397M18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79"
              />
            </svg>
          </div>
        </Button>
      </div>

      {/* Modal for confirming deletion */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body className="bg-light rounded translate" style={{ height: "300px" }}>
          <div
            className="d-flex"
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", margin: "90px 0px 20px 0px" }}
          >
            <h4 className="text-center mb-4">Are you sure you want to delete this Cart Item?</h4>
            <div
              className="d-flex justify-content-between gap-20 mt-10"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CartDeleteId;