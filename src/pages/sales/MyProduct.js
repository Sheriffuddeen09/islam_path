import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../Api/axios";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ Fetch user products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/my-products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Open modal
  const openModal = (product) => {
    setSelected(product);
    setModal(true);
  };

  // ✅ Update
  const updateProduct = async () => {
    try {
      await api.put(`/api/my-product/${selected.id}`, selected);
      fetchProducts();
      setModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Delete
  const deleteProduct = async (product) => {
  const result = await Swal.fire({
    title: "Delete Product?",
    text: `You are about to delete "${product.title}"`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it",
  });

  if (!result.isConfirmed) return;

  try {
    // ✅ Close edit modal (important)
    setModal(false);

    // ✅ Optimistic UI
    setProducts((prev) => prev.filter((p) => p.id !== product.id));

    // ✅ Toast with Undo
    const toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: true,
      confirmButtonText: "Undo",
      timer: 5000,
      timerProgressBar: true,
    });

    let undoClicked = false;

    toast.fire({
      icon: "success",
      title: "Product deleted",
    }).then((res) => {
      if (res.isConfirmed) {
        undoClicked = true;

        // Restore
        setProducts((prev) => [product, ...prev]);
      }
    });

    // Delay delete
    setTimeout(async () => {
      if (!undoClicked) {
        await api.delete(`/api/my-product/${product.id}`);
      }
    }, 5000);

  } catch (err) {
    console.error(err);
  }
};
  
  return (
  <div className="p-6 lg:ml-64">
    <h2 className="text-2xl font-bold mb-6 border-b-2 pb-3 border-blue-700">Product Lists</h2>

    {/* ✅ Loading Skeleton */}
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-3  gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg shadow animate-pulse"
          >
            <div className="h-40 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    ) : (
      <>
        {/* ✅ Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition"
            >
              <img
                src={`http://localhost:8000/storage/${p.front_image}`}
                alt=""
                className="h-40 w-full object-cover rounded"
              />

              <h3 className="font-semibold mt-2">{p.title}</h3>
              <p className="text-sm text-gray-500">₦{p.price}</p>

              <button
                onClick={() => openModal(p)}
                className="mt-3 w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
              >
                Edit
              </button>

              <button
                onClick={() => deleteProduct(selected)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                Delete
                </button>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No products found
          </p>
        )}
      </>
    )}

      {/* 🔥 EDIT MODAL */}

      

      {modal && selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-[400px] p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>

            {/* Title */}
            {selected.title && (
              <input
                value={selected.title}
                onChange={(e) =>
                  setSelected({ ...selected, title: e.target.value })
                }
                className="w-full border p-2 mb-2 rounded"
              />
            )}

            {/* Price */}
            {selected.price !== null && (
              <input
                type="number"
                value={selected.price}
                onChange={(e) =>
                  setSelected({ ...selected, price: e.target.value })
                }
                className="w-full border p-2 mb-2 rounded"
              />
            )}

            {/* Stock */}
            {selected.stock !== null && (
              <input
                type="number"
                value={selected.stock}
                onChange={(e) =>
                  setSelected({ ...selected, stock: e.target.value })
                }
                className="w-full border p-2 mb-2 rounded"
              />
            )}

            {/* Sale Type */}
            {selected.sale_type && (
              <select
                value={selected.sale_type}
                onChange={(e) =>
                  setSelected({ ...selected, sale_type: e.target.value })
                }
                className="w-full border p-2 mb-2 rounded"
              >
                <option value="physical">Physical</option>
                <option value="download">Download</option>
              </select>
            )}

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <button
                onClick={updateProduct}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>

            <button
              onClick={() => setModal(false)}
              className="mt-3 text-gray-500 w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}