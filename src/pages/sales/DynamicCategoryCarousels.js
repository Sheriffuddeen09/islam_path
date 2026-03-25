import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import api from "../../Api/axios";
import { useCart } from "./cart/CartContext";

export default function DynamicCategoryCarousels() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const { addToCart, loading } = useCart();

  const symbols = { USD: "$", NGN: "₦", EUR: "€", GBP: "£" };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProduct(true);
        const res = await api.get("/api/products");
        setProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProduct(false);
      }
    };

    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await api.get("/api/categories");
        setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const filterProducts = (productList, categoryId) =>
    productList.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryId ? p.category_id === categoryId : true;
      return matchesSearch && matchesCategory;
    });

  return (
    <div className="flex flex-col md:flex-row pt-20 min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white p-6 shadow-lg sm:block hidden overflow-y-auto h-[85vh] scrollbar-thin scrollbar-thumb-gray-400">
        <h2 className="text-xl font-bold mb-4 text-center">Search & Filters</h2>
        <input
          type="text"
          placeholder="Search products..."
          className="border p-2 rounded-lg w-full mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ul className="space-y-1">
          {loadingCategories ? (
            [...Array(10)].map((_, i) => (
              <li key={i} className="h-8 bg-gray-300 rounded animate-pulse"></li>
            ))
          ) : (
            <>
              <li
                onClick={() => setSelectedCategory(null)}
                className={`cursor-pointer p-2 rounded-lg ${
                  !selectedCategory
                    ? "bg-blue-500 text-white font-bold"
                    : "hover:bg-gray-200 text-black font-semibold"
                }`}
              >
                All Categories
              </li>
              {categories.map((parent) => (
                <div key={parent.id}>
                  <div
                    className={`font-bold cursor-pointer p-2 rounded ${
                      selectedCategory?.id === parent.id
                        ? "bg-blue-500 text-white font-bold"
                        : "hover:bg-gray-200 text-gray-800 font-bold"
                    }`}
                    onClick={() => setSelectedCategory(parent)}
                  >
                    {parent.name}
                  </div>
                  {parent.children.length > 0 && (
                    <ul className="ml-4 space-y-0">
                      {parent.children.map((child) => (
                        <li
                          key={child.id}
                          className={`cursor-pointer p-1 rounded ${
                            selectedCategory?.id === child.id
                              ? "bg-blue-400 text-white font-bold text-sm"
                              : "hover:bg-gray-100 text-blue-800 font-semibold text-sm"
                          }`}
                          onClick={() => setSelectedCategory(child)}
                        >
                          {child.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}
        </ul>
      </aside>

      {/* Main Section */}
      <section className="flex-1 p-6">
        {loadingProduct ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="h-40 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {(selectedCategory?.children || categories).map((parent) => {
              const parentProducts =
                selectedCategory && !selectedCategory.children
                  ? filterProducts(products, selectedCategory.id)
                  : filterProducts(products, parent.id);

              if (parentProducts.length === 0) return null;

              return (
                <div key={parent.id} className="mb-12">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{parent.name}</h2>
                    <button className="text-blue-600 font-semibold hover:underline">
                      See All
                    </button>
                  </div>

                  <Swiper
                    modules={[Navigation, Pagination]}
                    slidesPerView={2}
                    spaceBetween={10}
                    navigation
                    pagination={{ clickable: true }}
                    breakpoints={{
                      640: { slidesPerView: 2, spaceBetween: 10 },
                      768: { slidesPerView: 3, spaceBetween: 15 },
                      1024: { slidesPerView: 4, spaceBetween: 20 },
                      1280: { slidesPerView: 6, spaceBetween: 25 },
                    }}
                    className="mb-6"
                  >
                    {parentProducts.map((product) => (
                      <SwiperSlide key={product.id}>
                        <ProductCard
                          product={product}
                          symbols={symbols}
                          addToCart={addToCart}
                          loading={loading}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {parent.children &&
                    parent.children.map((child) => {
                      const childProducts = filterProducts(products, child.id);
                      if (childProducts.length === 0) return null;

                      return (
                        <div key={child.id} className="mb-8">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-semibold">{child.name}</h3>
                            <button className="text-blue-500 font-semibold hover:underline">
                              See All
                            </button>
                          </div>

                          <Swiper
                            modules={[Navigation, Pagination]}
                            slidesPerView={2}
                            spaceBetween={10}
                            navigation
                            pagination={{ clickable: true }}
                            breakpoints={{
                              640: { slidesPerView: 2, spaceBetween: 10 },
                              768: { slidesPerView: 3, spaceBetween: 15 },
                              1024: { slidesPerView: 4, spaceBetween: 20 },
                              1280: { slidesPerView: 6, spaceBetween: 25 },
                            }}
                          >
                            {childProducts.map((product) => (
                              <SwiperSlide key={product.id}>
                                <ProductCard
                                  product={product}
                                  symbols={symbols}
                                  addToCart={addToCart}
                                  loading={loading}
                                />
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </>
        )}
      </section>
    </div>
  );
}

// Reusable Product Card
const ProductCard = ({ product, symbols, addToCart, loading }) => {
  const firstImage = product.images?.[0]?.image_path
    ? `http://localhost:8000/storage/${product.images[0].image_path}`
    : "/placeholder.png";
  const symbol = symbols[product.currency] || product.currency;

  return (
    <div className="relative bg-white p-2 rounded-lg shadow hover:shadow-lg transition group">
      {product.discount > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          {product.discount}%
        </span>
      )}

      <Link to={`/product/${product.id}`}>
        <img
          src={firstImage}
          alt={product.title}
          className="h-48 w-full object-cover rounded-lg mb-2"
        />
        <h3 className="font-semibold text-gray-800 text-center">{product.title}</h3>

        {product.stock > 0 ? (
          <p className="text-sm text-center mt-1 font-medium">
            {product.stock <= 5 ? `Only ${product.stock} left!` : `In stock: ${product.stock}`}
          </p>
        ) : (
          <p className="text-sm text-center mt-1 font-medium text-gray-500">Out of Stock</p>
        )}

        <div className="flex justify-center items-center gap-2 mt-1">
          {product.discount > 0 ? (
            <>
              <span className="text-gray-400 line-through text-sm">{symbol}{product.price}</span>
              <span className="text-gray-800 font-semibold text-sm">
                {symbol}{(product.price - (product.price * product.discount) / 100).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-gray-800 font-semibold text-sm">{symbol}{product.price}</span>
          )}
        </div>
      </Link>

      <button
        className={`mt-2 w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center ${
          product.stock <= 0 || loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={product.stock <= 0 || loading}
        onClick={() => addToCart(product)}
      >
        {loading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
        ) : (
          "Add to Cart"
        )}
      </button>

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
};