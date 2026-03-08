import React, { useState, useEffect } from "react";
import { FaHeart, FaStar } from "react-icons/fa";
import api from "../../Api/axios";
import { useCart } from "./cart/CartContext";
import { Link } from "react-router-dom";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { addToCart } = useCart();

  // Fetch products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products");
        setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory
      ? p.category_id === parseInt(selectedCategory)
      : true;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col md:flex-row pt-20 min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white p-6 shadow-lg sm:block hidden 
       h-[85vh] w-80 bg-white shadow-md p-4 z-40
      overflow-y-auto overflow-x-hidden
      scrollbar-thin scrollbar-thumb-gray-400">
        <h2 className="text-xl font-bold text-black mb-4 text-center">Search & Filters</h2>

        <input
          type="text"
          placeholder="Search products..."
          className="border p-2 rounded-lg w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

       <ul className="space-y-4 mb-">
            <li
              onClick={() => setSelectedCategory(null)}
              style={{
                  margin: 5
                }}
              className={`cursor-pointer p-2 text-sm rounded-lg mb-5 ${
                !selectedCategory
                  ? "bg-blue-500 text-white hover:bg-gray-100 hover:text-black font-semibold"
                  : "hover:bg-gray-200 bg-transparent text-black font-semibold"
              }`}
            >
              All Categories
            </li>

            {categories.map((cat) => (
              <li
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)} style={{
                  margin: 5
                }}
                className={`cursor-pointer px-2 py-2 -my-3 space-y-0 rounded-lg capitalize ${
                  selectedCategory === cat.id ? "bg-blue-500 text-white" : "hover:text-gray-800 hover:bg-gray-200 text-black font-semibold"
                }`}
              >
                {cat.name}
              </li>
            ))}
          </ul>
      </aside>

      {/* Products */}
      <section className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            
            const firstImage = product.images?.[0]?.image_path
            ? `http://localhost:8000/storage/${product.images[0].image_path}`
            : "/placeholder.png";

            return (
              <div
                key={product.id}
                className="relative bg-white p-4 rounded-lg shadow hover:shadow-lg transition group"
              >
                {/* Discount badge */}
                {product.discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    -{product.discount}%
                  </span>
                )}

                {/* Out of stock overlay */}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center text-white font-bold text-lg z-10 rounded-lg">
                    Out of Stock
                  </div>
                )}

                {/* Product Image */}
                <Link to={`/product/${product.id}`}>
                <img
                  src={firstImage}
                  alt={product.title}
                  className="sm:h-48 h-60 w-full text-black sm:object-cover rounded-lg mb-2"
                />

                {/* Product Info */}
                <h3 className="font-semibold text-gray-800 mx-auto text-center">{product.title}</h3>
                <p className="text-gray-600 text-sm mx-auto text-center font-semibold">{product.currency} {product.price}</p>
                </Link>
                {/* Add to cart */}
                <button
                  className={`mt-2 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition ${
                    product.stock <= 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={product.stock <= 0}
                  onClick={()=>addToCart(product)}
                >
                  Add to Cart
                </button>

                {/* Hover actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex flex-col gap-2">
                  <button
                    onClick={() => console.log("Add to wishlist", product.id)}
                    className="bg-gray-800 p-2 rounded shadow hover:bg-gray-600"
                  >
                    <FaHeart className="text-white mx-auto" />
                  </button>
                  <div className="bg-gray-800 px-2 py-1 rounded shadow flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm text-white font-medium">{product.review_total || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <p className="text-gray-600 col-span-full text-center mt-10">
              No products found.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}