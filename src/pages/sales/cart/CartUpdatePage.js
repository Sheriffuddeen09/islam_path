import { useState } from "react";
import UpdateCartPatch from "./CartPatch";

const CartPageUpdate = () => {
  const [showModal, setShowModal] = useState(false); // Modal visibility state

  const handleOpenModal = () => {
    setShowModal(true); // Show modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Hide modal
  };

  return (
    <div className="container my-5">
      <button className="btn btn-primary" onClick={handleOpenModal}>
        Update
      </button>

      {/* Bootstrap Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Cart</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Render UpdateCartPatch inside the modal */}
                <UpdateCartPatch />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
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

export default CartPageUpdate;