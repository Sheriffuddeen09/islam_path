import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import api from "../../Api/axios";
import { useCart } from "./cart/CartContext";
import { FaHeart, FaStar } from "react-icons/fa";
import SearchProduct from "./SearchProduct";

export default function ProductPage({products, setProducts}) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { addToCart, loading: cartLoading } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const symbols = { USD: "$", NGN: "₦", EUR: "€", GBP: "£" };


  useEffect(() => {
  const handleCategorySelect = (e) => {
    setSelectedCategory(e.detail);
  };

  window.addEventListener("selectCategory", handleCategorySelect);

  return () => {
    window.removeEventListener("selectCategory", handleCategorySelect);
  };
}, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, c] = await Promise.all([api.get("/api/products"), api.get("/api/categories")]);
        setProducts(p.data.data || []);
        setCategories(c.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRandomProducts = (arr, count = 5) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

  const getCategoryProducts = (category) => {
    if (!category) return products;
    const collectChildIds = (cat) => {
      let ids = [String(cat.id)];
      if (cat.children?.length) cat.children.forEach((child) => (ids = ids.concat(collectChildIds(child))));
      return ids;
    };
    const allowedIds = collectChildIds(category);
    return products.filter((p) => allowedIds.includes(String(p.category_id)));
  };

  // Use filtered products if a category is selected, otherwise all products
  const sourceProducts = selectedCategory ? getCategoryProducts(selectedCategory) : products;

  const flashSales = getRandomProducts(sourceProducts.filter((p) => p.discount > 0), 10);
  const topSelling = getRandomProducts([...sourceProducts].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0)), 10);
  const bannerProducts = getRandomProducts(sourceProducts, 5);

useEffect(() => {
  if (!bannerProducts.length) return;

  const interval = setInterval(() => {
    setCurrentSlide((prev) =>
      prev === bannerProducts.length - 1 ? 0 : prev + 1
    );
  }, 3000);

  return () => clearInterval(interval);
}, [bannerProducts]);

  return (
    <div className="pt-20 bg-gray-100 min-h-screen">
      <div className="flex px-4 md:px-2">
        {/* ===== Sidebar z- ===== */}
        <aside className="w-64 bg-white shadow p-4 hidden md:block sticky scrollbar-thin top-20 h-[calc(100vh-80px)] overflow-y-auto">
          <h2 className="text-xl font-bold text-black mb-4 text-center">Search & Filters</h2>
          
          <SearchProduct />

          {loading ? (
            <div className="space-y-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <ul>
              <li
                onClick={() => setSelectedCategory(null)}
                className={`p-2 cursor-pointer rounded text-sm ${
                  !selectedCategory ? "bg-gray-900 text-white" : "hover:bg-gray-200 text-black font-semibold"
                }`}
              >
                All Categories
              </li>
              {categories.map((cat) => (
                <div key={cat.id}>
                  <li
                    onClick={() => setSelectedCategory(cat)}
                    className={`font-bold cursor-pointer p-2 text-[17px] mt-2 rounded ${
                      selectedCategory?.name === cat.name
                        ? "bg-gray-900 text-white font-bold"
                        : "hover:bg-gray-200 text-gray-800 font-bold"
                    }`}
                  >
                    {cat.name}
                  </li>
                  {cat.children?.map((child) => (
                    <li
                      key={child.id}
                      onClick={() => setSelectedCategory(child)}
                      className={`cursor-pointer p-1 rounded pl-6 my-1 ${
                      selectedCategory?.id === child.id
                        ? "bg-gray-900 text-white font-bold text-sm p-1 "
                        : "hover:bg-gray-100 text-blue-800 font-semibold text-sm p-1"
                        }`}
                    >
                      {child.name}
                    </li>
                  ))}
                </div>
              ))}
            </ul>
          )}
        </aside>

        {/* ===== Main Content ===== */}
        <section className="flex-1 ml-0 md:ml-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 justify-items-center md:justify-items-stretch">
              {[...Array(8)].map((_, i) => (
               <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
                <div className="h-40 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
              ))}
            </div>
          ) : sourceProducts.length === 0 && selectedCategory ? (
            <div className="p-4 bg-white rounded shadow text-center text-gray-600 mt-4">
              No products found for "{selectedCategory.name}"
            </div>
          ) : (
            <>
              {/* ===== Banner Slider ===== */}
              <>
<div className="mt-0 border-gray-500 border-b-2 pb-2 mb-2 w-full flex justify-between items-center md:hidden">
  <button
    onClick={() => setShowFilter(true)} className="text-black font-bold text-sm inline-flex gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>

  Search / Filter Products
</button>

<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-black">
  <path stroke-linecap="round" stroke-linejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
</svg>

</div>

{showFilter && (
  <div className="fixed inset-0 z-50 flex">
    
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black/50"
      onClick={() => setShowFilter(false)}
    ></div>

    {/* Modal Panel */}
    <div className="relative w-3/4 max-w-sm bg-white h-full shadow-lg p-4 overflow-y-auto animate-slideIn">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Search & Filters</h2>
        <button
          onClick={() => setShowFilter(false)}
          className="text-black text-xl"
        >
          ✕
        </button>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search products..."
        className="border p-2 rounded-lg w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CATEGORY LIST */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
      ) : (
        <ul>
          <li
            onClick={() => {
              setSelectedCategory(null);
              setShowFilter(false);
            }}
            className={`p-2 cursor-pointer rounded text-sm ${
              !selectedCategory
                ? "bg-gray-900 text-white"
                : "hover:bg-gray-200 text-black font-semibold"
            }`}
          >
            All Categories
          </li>

          {categories.map((cat) => (
            <div key={cat.id}>
              <li
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowFilter(false);
                }}
                className={`font-bold cursor-pointer p-2 mt-2 rounded ${
                  selectedCategory?.name === cat.name
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-200 text-gray-800"
                }`}
              >
                {cat.name}
              </li>

              {cat.children?.map((child) => (
                <li
                  key={child.id}
                  onClick={() => {
                    setSelectedCategory(child);
                    setShowFilter(false);
                  }}
                  className={`cursor-pointer p-1 rounded pl-6 my-1 ${
                    selectedCategory?.id === child.id
                      ? "bg-gray-900 text-white text-sm"
                      : "hover:bg-gray-100 text-blue-800 text-sm"
                  }`}
                >
                  {child.name}
                </li>
              ))}
            </div>
          ))}
        </ul>
      )}
    </div>
  </div>
)}

  {selectedCategory ? (
    <Section
      title={selectedCategory.name}
      products={sourceProducts}
      symbols={symbols}
      addToCart={addToCart}
      cartLoading={cartLoading}
    />
  ) : (
      <>
        {/* ===== HOMEPAGE ===== */}

        {/* Banner */}
        {bannerProducts.length > 0 && (
  <div className="mb-6 mt-4 rounded-lg relative overflow-hidden group">

    {/* Left Arrow */}
<button
  onClick={() =>
    setCurrentSlide((prev) =>
      prev === 0 ? bannerProducts.length - 1 : prev - 1
    )
  }
   className="absolute left-5 text-white top-1/2 -translate-y-1/2 text-3xl bg-black/50 p-1 rounded-full hover:bg-black/70"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
</button>

{/* Right Arrow */}
<button
  onClick={() =>
    setCurrentSlide((prev) =>
      prev === bannerProducts.length - 1 ? 0 : prev + 1
    )
  }
   className="absolute right-6 text-white top-1/2 -translate-y-1/2 text-3xl bg-black/50 p-1 rounded-full hover:bg-black/70"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>
</button>

    {/* Slides */}
    <div
      className="flex transition-transform duration-700 ease-in-out"
      style={{
        transform: `translateX(-${currentSlide * 100}%)`,
      }}
    >
      {bannerProducts.map((p) => (
        <div key={p.id} className="min-w-full">
          <Link to={`/product/${p.id}`}>
            <img
              src={
                p.images?.[0]?.image_path
                  ? `http://localhost:8000/storage/${p.images[0].image_path}`
                  : "/placeholder.png"
              }
              className="w-full h-60 md:h-80 object-contain rounded"
            />
          </Link>
        </div>
      ))}
    </div>

    {/* Dots */}
    <div className="absolute bottom-4 left-1/2 transform bg-white px-2 py-1 rounded bg-opacity-30 -translate-x-1/2 flex gap-2">
      {bannerProducts.map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentSlide(index)}
          className={`w-2 h-2 rounded-full transition ${
            currentSlide === index
              ? "bg-black scale-110"
              : "bg-white"
          }`}
        ></button>
      ))}
    </div>

  </div>
)}

        {/* Flash Sales */}
        {flashSales.length > 0 && (
          <Section title="🔥 Flash Sales" products={flashSales} {...{ symbols, addToCart, cartLoading }} />
        )}

        {/* Top Selling */}
        {topSelling.length > 0 && (
          <Section title="⭐ Top Selling" products={topSelling} {...{ symbols, addToCart, cartLoading }} />
        )}

        {/* Category Sections */}
        {categories.map((cat) => {
          const catProducts = getCategoryProducts(cat);
          if (!catProducts.length) return null;

          return (
            <Section
              key={cat.id}
              title={cat.name}
              products={catProducts}
              symbols={symbols}
              addToCart={addToCart}
              cartLoading={cartLoading}
            />
          );
        })}
      </>
    )}
  </>
              {/* ===== Category Sections ===== */}
              {!selectedCategory
                ? categories.map((cat) => {
                    const catProducts = getCategoryProducts(cat);
                    if (!catProducts.length) return null;
                    return (
                      <Section
                        key={cat.id}
                        title={cat.name}
                        products={catProducts}
                        symbols={symbols}
                        addToCart={addToCart}
                        cartLoading={cartLoading}
                      />
                    );
                  })
                : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
const getCategoryColor = (title) => {
  switch (title.toLowerCase()) {
    case "electronic":
      return "bg-gradient-to-r from-gray-900 to-indigo-500";
    case "islamic-content":
      return "bg-gradient-to-r from-pink-800 to-rose-500";
    case "accessory":
      return "bg-gradient-to-r from-green-800 to-emerald-500";
    case "clothes":
      return "bg-gradient-to-r from-yellow-800 to-orange-500";
    case "house-accessory":
      return "bg-gradient-to-r from-red-800 to-orange-500";
      case "frame":
      return "bg-gradient-to-r from-red-800 to-orange-500";
    default:
      return "bg-blue-800";
  }
};

// ===== Section Component =====
const Section = ({ title, products, symbols, addToCart, cartLoading }) => (

  
  <div className="mb-10">
    <div
      className={`flex justify-between items-center mt-4 mb-3 p-3 rounded-lg shadow text-white ${getCategoryColor(title)}`}
    >
      <h2 className="text-lg font-bold">{title}</h2>
      <button className="text-white text-sm font-semibold hover:underline">
        See More
      </button>
    </div>
    <Swiper
      modules={[Navigation]}
      slidesPerView={2}
      spaceBetween={10}
      navigation
      breakpoints={{
        640: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 4 },
        1280: { slidesPerView: 6 },
      }}
    >
      {products.map((p) => (
        <SwiperSlide key={p.id}>
          <ProductCard product={p} symbols={symbols} addToCart={addToCart} cartLoading={cartLoading} />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
);

// ===== Product Card =====
const ProductCard = ({ product, symbols, addToCart, cartLoading }) => {
  const [hover, setHover] = useState(false);
  const cardRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (cardRef.current) setWidth(cardRef.current.offsetWidth);
  }, [cardRef.current]);

  const img = product.images?.[0]?.image_path ? `http://localhost:8000/storage/${product.images[0].image_path}` : "/placeholder.png";
  const symbol = symbols[product.currency] || product.currency;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded shadow-sm hover:shadow-md mx-auto sm:w-60 w-80 transition px-2 py-4 group relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {product.discount > 0 && (
        <span className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded top-2 left-2">
          -{product.discount}%
        </span>
      )}

      <Link to={`/product/${product.id}`}>
        <img src={img} loading="lazy" className="h-52 w-full object-cover rounded" />
        <h3 className="text-sm mt-2 text-gray-800 line-clamp-2">{product.title}</h3>
        <div className="mt-1 text-gray-800">
          {product.discount > 0 ? (
            <>
              <span className="line-through text-gray-400 text-xs">{symbol}{product.price}</span>
              <div className="font-bold">{symbol}{(product.price - (product.price * product.discount) / 100).toFixed(2)}</div>
            </>
          ) : (
            <span className="font-bold">{symbol}{product.price}</span>
          )}
        </div>
      </Link>

      <button
        onClick={() => addToCart(product)}
        disabled={cartLoading}
        className="mt-2 w-full p-3 bg-orange-600 text-white font-bold rounded text-sm hover:bg-orange-700"
      >
        Add to Cart
      </button>

      {/* Hover Preview */}
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