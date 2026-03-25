
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../Api/axios";
import EditProductModal from "./EditProductModal";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);

  // Fetch user products
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

  // Open modal
  const openModal = (product) => {
    setSelectedProduct(product);
    setModal(true);
  };

  // Delete product
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
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      await api.delete(`/api/my-product/${product.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const symbols = {
  USD: "$",
  NGN: "₦",
  EUR: "€",
  GBP: "£",
};

  return (
    <div className="p-6 lg:ml-64">
      <h2 className="text-2xl font-bold mb-6 border-b-2 pb-3 border-blue-700">
        Product Lists
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
              <div className="h-40 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

  {products.map((p) => {
  // ✅ Declare firstImage inside the block
  const firstImage = p.images?.[0]?.image_path
    ? `http://localhost:8000/storage/${p.images[0].image_path}`
    : "/placeholder.png";

     const symbol = symbols[p.currency] || p.currency;

  return (
    <div key={p.id} className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition relative">
      <img
        src={firstImage}
        alt={p.title}
        className="h-40 w-full object-cover rounded"
      />
      <h3 className="font-bold text-lg mt-3 mb-1">{p.title}</h3>
      <div className="flex justify-start items-start gap-2">
        {p.discount > 0 ? (
          <>
            <span className="text-gray-400 line-through text-sm">
              {symbol}{p.price}
            </span>
            <span className="text-gray-800 font-semibold text-sm">
              {symbol}{(p.price - (p.price * p.discount) / 100).toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-gray-800 font-semibold text-sm">
            {symbol}{p.price}
          </span>
        )}
      </div>

      <div className="absolute top-0 right-3 flex flex-col gap-3">
        <button
          onClick={() => openModal(p)}
          className="mt-3 w-12 bg-gray-800 flex flex-col text-xs items-center text-white py-1 rounded-lg hover:bg-gray-900"
        >
          Edit
        </button>

        <button
          onClick={() => deleteProduct(p)}
          className="bg-gray-800 w-12 text-white flex flex-col text-xs items-center py-1 rounded-lg hover:bg-gray-900"
        >
          Delete
        </button>
      </div>
    </div>
  );
})}
        
        </div>
      )}

      {/* EDIT MODAL */}
      {modal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          setModal={setModal}
          fetchProducts={fetchProducts}
        />
      )}

      {products.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No products found
          </p>
        )}
    </div>
  );
}


