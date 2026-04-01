import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import api from "../../Api/axios";
import { useCart } from "./cart/CartContext";
import { FaHeart, FaStar } from "react-icons/fa";
import SearchProduct from "./SearchProduct";
import { Loader2, Search } from "lucide-react";
import { useWishlist } from "./cart/WishlistContext";
import { useAuth } from "../../layout/AuthProvider";

export default function ProductPage({products, setProducts}) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, loadingId: cartLoadingId } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const symbols = { USD: "$", NGN: "₦", EUR: "€", GBP: "£" };
  const { addToWishlist, loadingId: wishlistLoadingId } = useWishlist()

    const authUser = useAuth()
  

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

  const getSeed = () => {
  const now = new Date();
  const days = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  return Math.floor(days / 5); // changes every 5 days
};

const shuffleWithSeed = (array, seed) => {
  let arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed + i) % arr.length;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getRandomProducts = (arr, count = 5) => {
  const seed = getSeed();
  return shuffleWithSeed(arr, seed).slice(0, count);
};
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

  const flashSaleSource = sourceProducts.filter((p) => p.discount > 0);
  const topSellingSource = [...sourceProducts].sort(
    (a, b) => (b.sales_count || 0) - (a.sales_count || 0)
  );

  const flashSales =
  flashSaleSource.length > 12
    ? getRandomProducts(flashSaleSource, 10)
    : [];

const topSelling =
  topSellingSource.length > 12
    ? getRandomProducts(topSellingSource, 10)
    : [];  const bannerProducts = getRandomProducts(sourceProducts, 5);

useEffect(() => {
  if (!bannerProducts.length) return;

  const interval = setInterval(() => {
    setCurrentSlide((prev) =>
      prev === bannerProducts.length - 1 ? 0 : prev + 1
    );
  }, 3000);

  return () => clearInterval(interval);
}, [bannerProducts]);

const [searchOpen, setSearchOpen] = useState(false);
const [query, setQuery] = useState("");

const openSearchModal = () => {
    setQuery("");
    setSearchOpen(true);
  };

  return (
    <div className="pt-20 bg-gray-100 min-h-screen">
      <div className="flex px-2 md:px-2">
        {/* ===== Sidebar z- ===== */}
        <aside className="w-64 bg-white shadow p-4 hidden md:block sticky scrollbar-thin top-20 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
          <h2 className="text-xl font-bold text-black mb-4 text-center">Search & Filters</h2>
          
          <div className="relative w-full mb-4">
        <input
          type="text"
          placeholder="Search products..."
          readOnly
          onClick={openSearchModal}
          className="border p-2 rounded-lg w-full cursor-pointer bg-gray-100 text-black"
        />
        <Search
          onClick={openSearchModal}
          className="absolute right-2 top-2 w-5 h-5 text-gray-400 cursor-pointer"
        />
      </div>
         

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
        <section className="flex-1 ml-0  md:mx-4">
          {loading ? (
            <div className="grid grid-cols-1 mt-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
               <div key={i} className="bg-white sm:p-4 p-2 rounded-lg shadow animate-pulse">
                <div className="h-40 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-2 bg-gray-300 rounded w-1/2 mb-2"></div>
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
        <h2 className="text-lg font-bold text-black">Search & Filters</h2>
        <button
          onClick={() => setShowFilter(false)}
          className="text-black text-xl"
        >
          ✕
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full mb-4">
        <input
          type="text"
          placeholder="Search products..."
          readOnly
          onClick={openSearchModal}
          className="border p-2 rounded-lg w-full cursor-pointer bg-gray-100 text-black"
        />
        <Search
          onClick={openSearchModal}
          className="absolute right-2 top-2 w-5 h-5 text-gray-400 cursor-pointer"
        />
      </div>

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
                className={`font-bold text-[17px] cursor-pointer p-2 mt-2 rounded ${
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
                  className={`cursor-pointer font-semibold p-1 rounded pl-6 my-1 ${
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
        cartLoadingId={cartLoadingId}
        wishlistLoadingId={wishlistLoadingId}
        addToWishlist={addToWishlist}
      />
    ) : (
        <>
     {bannerProducts.length > 0 && (
    <div className="mb-6 mt-4 rounded-lg relative overflow-hidden group">

  
      <div
  className="flex transition-transform duration-700 ease-in-out"
  style={{
    transform: `translateX(-${currentSlide * 100}%)`,
  }}
>
  {bannerProducts.map((p) => {
    const shortDesc =
      p.description?.split(" ").slice(0, 20).join(" ") + "..."; // ~100 words max

      const isOwner = p.user_id === authUser.user?.id;
      const isLoading = cartLoadingId === p.id;

    return (
      <div key={p.id} className="min-w-full px-1">
          <div className="relative h-72 md:h-96 rounded-2xl  overflow-hidden shadow-lg group">

          <button
    onClick={() =>
      setCurrentSlide((prev) =>
        prev === 0 ? bannerProducts.length - 1 : prev - 1
      )
    }
    className="absolute left-2 text-white top-1/2 z-50  text-3xl bg-black/50 p-1 rounded-full hover:bg-black/70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
  </button>

  <button
    onClick={() =>
      setCurrentSlide((prev) =>
        prev === bannerProducts.length - 1 ? 0 : prev + 1
      )
    }
    className="absolute right-3 text-white top-1/2  z-50 text-3xl bg-black/50 p-1 rounded-full hover:bg-black/70"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
  </button>


            <img
              src={
                p.images?.[0]?.image_path
                  ? `http://localhost:8000/storage/${p.images[0].image_path}`
                  : "/placeholder.png"
              }
              className="absolute inset-0 w-full h-full flex-1 group-hover:scale-105 transition duration-700"
            />

             <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>

            <div className="absolute z-10 sm:p-10 p-5 text-white">
              {p.discount > 0 && (
                <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full w-fit mb-5 shadow">
                  🔥 {p.discount}% OFF
                </span>
              )}

              <h2 className="text-2xl md:text-4xl font-bold leading-tight mt-3 mb-3">
                {p.title}
              </h2>

              <p className="text-sm md:text-base font-bold w-80 text-gray-200 mb-2 line-clamp-3">
                {shortDesc}
              </p>

              <p
                className={`text-sm mb-2 font-semibold ${
                  p.stock > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {p.stock > 0
                  ? `✔ In Stock (${p.stock})`
                  : "✖ Out of Stock"}
              </p>

             
              <div className=" gap-3">
               
                <button
                  onClick={() => addToCart(p)}
                  className={`mt-2 bg-white px-3 text-black py-2 rounded-lg font-semibold transition inline-flex items-center gap-2
                    ${
                      p.stock <= 0 || isLoading || isOwner
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-gray-100"
                    }`}
                  disabled={p.stock <= 0 || isLoading || isOwner}
                >
                  {isOwner
                    ? "Your Product"
                    : isLoading
                    ? <span className="flex items-center gap-2"><Loader2 /> Ordering...</span>
                    : "Order Now"}
                </button>
                <Link to={`/product/${p.id}`}> 
                <button className="border border-white px-5 py-2 translate-x-3 rounded-lg hover:bg-white hover:text-black transition">
                  View Details
                </button>
               </Link> 

              </div>
            </div>
          </div>
      </div>
    );
  })}
</div>


    </div>
  )} 

          {flashSales.length > 0 && (
            <Section title="🔥 Flash Sales" products={flashSales} {...{ symbols, addToCart, cartLoadingId, addToWishlist, wishlistLoadingId }} />
          )}

          {topSelling.length > 0 && (
            <Section title="⭐ Top Selling" products={topSelling} {...{ symbols, addToCart, cartLoadingId, addToWishlist, wishlistLoadingId }} />
          )}

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
                cartLoadingId={cartLoadingId}
                addToWishlist={addToWishlist} 
                wishlistLoadingId={wishlistLoadingId}
              />
            );
          })}
        </>
      )}
    </> 
              </>
            )}
          </section>
        </div>
        {searchOpen && (
          <div
            className="fixed top-0 w-full h-full z-[9999] flex flex-1 items- bg-black/30 backdrop-blur-sm">
                <SearchProduct
                    onCategorySelect={(category) => {
                    setSelectedCategory(category);
                  }}
                  query={query}
                  searchOpen={searchOpen}
                  setSearchOpen={setSearchOpen}
                  setQuery={setQuery}
            />
            </div>
                )}
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

const Section = ({
  title,
  products,
  symbols,
  addToCart,
  cartLoadingId,
  addToWishlist,
  wishlistLoadingId,
  isScrollable = false,
}) => {
  const ITEMS_PER_PAGE = isScrollable ? 8 : products.length;
  const [page, setPage] = useState(0);
  

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  return (
    <div className="mb-10 mx-auto">
       <div
        className={`flex justify-between items-center  mt-4 mb-3 p-3 rounded-lg shadow text-white ${getCategoryColor(
          title
        )}`}
      >
        <h2 className="text-lg font-bold">{title}</h2>

        <div className="flex items-center gap-2">
          {isScrollable && page > 0 && (
            <button
              onClick={() => setPage((prev) => prev - 1)}
              className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
            >
              ◀
            </button>
          )}

          {isScrollable && page < totalPages - 1 && (
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
            >
              ▶
            </button>
          )}

          <button className="text-white text-sm font-semibold hover:underline">
            See More
          </button>
        </div>
      </div>

      {isScrollable ? (
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              width: `${totalPages * 100}%`,
              transform: `translateX(-${page * (100 / totalPages)}%)`,
            }}
          >
            {Array.from({ length: totalPages }).map((_, i) => {
              const start = i * ITEMS_PER_PAGE;
              const slice = products.slice(start, start + ITEMS_PER_PAGE);

              return (
                <div
                  key={i}
                  className="w-full grid grid-cols-1 sm:grid-cols-4 gap- px-1"
                >
                  {slice.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      symbols={symbols}
                      addToCart={addToCart}
                      cartLoadingId={cartLoadingId}
                      addToWishlist={addToWishlist}
                      wishlistLoadingId={wishlistLoadingId}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              symbols={symbols}
              addToCart={addToCart}
              cartLoadingId={cartLoadingId}
              addToWishlist={addToWishlist}
              wishlistLoadingId={wishlistLoadingId}
            />
          ))}
        </div>
      )} 
    </div>
  );
};


// ===== Product Card =====
const ProductCard = ({ product, symbols, addToCart, cartLoadingId, addToWishlist, wishlistLoadingId }) => {
  const [hover, setHover] = useState(false);
  const cardRef = useRef(null);
  const [width, setWidth] = useState(0);

  const isLoading = cartLoadingId === product.id;
  const isWishlistLoading = wishlistLoadingId === product.id;

  const authUser = useAuth()

  console.log("user Product", authUser)
  

  const isOwner = product.user_id === authUser.user?.id;



  useEffect(() => {
    if (cardRef.current) setWidth(cardRef.current.offsetWidth);
  }, [cardRef.current]);

  const img = product.images?.[0]?.image_path ? `http://localhost:8000/storage/${product.images[0].image_path}` : "/placeholder.png";
  const symbol = symbols[product.currency] || product.currency;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded shadow-sm hover:shadow-md mx-auto sm:w-60 w-full transition px-4 py-3 group relative"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {product.discount > 0 && (
        <span className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded top-2 left-2">
          -{product.discount}%
        </span>
      )}

      <Link to={`/product/${product.id}`}>
        <img src={img} loading="lazy" className="h-64 sm:h-52 w-full sm:object-cover rounded" />
        <h3 className="text-sm mt-2 text-gray-800 line-clamp-2">{product.title}</h3>
        <div className="mt-1 text-gray-800">
          {product.discount > 0 ? (
            <div className="inline-flex items-center gap-3">
              <span className="line-through text-gray-400 text-sm">{symbol}{product.price}</span>
              <div className="font-bold">{symbol}{(product.price - (product.price * product.discount) / 100).toFixed(2)}</div>
            </div>
          ) : (
            <span className="font-bold">{symbol}{product.price}</span>
          )}
        </div>
      </Link>

      <button
        className={`mt-2 w-full bg-orange-600 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center
          ${
            product.stock <= 0 || isLoading || isOwner
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-orange-700"
          }`}
        disabled={product.stock <= 0 || isLoading || isOwner}
        onClick={() => addToCart(product)}
      >
        {isOwner ? (
          "Your Product"
        ) : isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        ) : (
          "Add to Cart"
        )}
      </button>

      {/* Hover Preview total */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition flex flex-col gap-2">
        <button
          className={`bg-gray-800 p-2 rounded shadow transition
            ${
              product.stock <= 0 || isWishlistLoading || isOwner
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-600"
            }`}
          disabled={product.stock <= 0 || isWishlistLoading || isOwner}
          onClick={() => addToWishlist(product)}
        >
          {isOwner ? (
            <span className="text-xs text-white">You</span>
          ) : isWishlistLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          ) : (
            <FaHeart className="text-white mx-auto" />
          )}
        </button>
        <div className="bg-gray-800 px-2 py-1 rounded shadow flex items-center gap-1">
          <FaStar className="text-yellow-400 text-sm" />
          <span className="text-sm text-white font-medium">{product.reviews_count || 0}</span>
        </div>
      </div>
    </div>
  );
};