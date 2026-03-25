import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../Api/axios";
import { FaStar } from "react-icons/fa";
import ProductGallery from "./ProductGallery"
import RecentlyViewed from "./RecentlyViewed"
import RelatedProducts from "./RelatedProducts"
import ProductSkeleton from "./ProductSkeleton"
import { useCart } from "./cart/CartContext";
import { Star } from "lucide-react";


export default function SingleProduct({products, setProducts}) {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3); // show 3 initially
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { addToCart, loading } = useCart();

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);

      if (res.data.images?.length > 0) {
        setMainImage(
          `http://localhost:8000/storage/${res.data.images[0].image_path}`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
  setLoadingReviews(true);
  try {
    const res = await api.get(`/api/products/${id}/reviews`);
    setReviews(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingReviews(false);
  }
};

const loadMoreRef = useRef(null);

useEffect(() => {
  if (!loadMoreRef.current) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && visibleCount < reviews.length) {
        setVisibleCount((prev) => prev + 3);
      }
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 1.0, // trigger when fully visible
    }
  );

  observer.observe(loadMoreRef.current);

  return () => observer.disconnect();
}, [reviews, visibleCount]);


  const submitReview = async () => {
  if (!rating || !comment) return; // optional validation
  setSubmitting(true);
  try {
    await api.post(`/api/products/${id}/reviews`, { rating, comment });
    setRating(0);
    setComment("");
    fetchReviews();
  } catch (err) {
    console.error(err);
  } finally {
    setSubmitting(false);
  }
};

  useEffect(()=>{

  if(product){

    let viewed =
      JSON.parse(localStorage.getItem("recent_products")) || [];

    viewed = viewed.filter(p => p !== product.id);

    viewed.unshift(product.id);

    viewed = viewed.slice(0,6);

    localStorage.setItem(
      "recent_products",
      JSON.stringify(viewed)
    );

  }

},[product])


const galleryImages = product
  ? [
      product.front_image,
      product.back_image,
      product.side_image,
      ...(product.images?.map((img) => img.image_path) || []),
    ]
      .filter(Boolean)
      .map((path, index) => ({
        id: index,
        image_path: path,
      }))
  : [];


const conversionRates = {
  NGN: 1,
  USD: 0.0013, // 1 NGN ≈ 0.0013 USD
  EUR: 0.0012, // 1 NGN ≈ 0.0012 EUR
  GBP: 0.0010, // 1 NGN ≈ 0.0010 GBP
};

function formatCurrency(amount, currency) {
  const rate = conversionRates[currency] || 1;
  const convertedAmount = amount * rate;

  // Use Intl.NumberFormat for proper formatting
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(convertedAmount);
}



const specificationsRef = useRef(null);
const keyFeaturesRef = useRef(null);

  if (!product) return <ProductSkeleton />;


  return (
    <div className="max-w-7xl mx-auto sm:p-6 p-2">

      {/* TOP SECTION */}
      <div className="grid mt-14 sm:mt-16 md:grid-cols-3 gap-8 lg:gap-28">

        {/* LEFT SIDE */}
        <div className="md:col-span-2">

          {/* Main Image */}

          <ProductGallery images={galleryImages} product={product} />

          <div className="sm:hidden flex mt-6 px-2 flex-col gap-3">

              {/* TITLE */}
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight">
                {product.title}
              </h1>

              {/* RATING */}
              <div className="flex items-center gap-2">

                {/* 5 Stars */}
                <div className="flex text-orange-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>

                {/* REVIEW COUNT */}
                <span className="text-gray-600 whitespace-nowrap text-sm">
                  ({product.review_total} reviews)
                </span>

              </div>

              {/* PRICE */}
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-black">
                  {product.currency} {product.price}
                </span>
              </div>

              {/* EXTRA UI (optional but looks better) */}
              <div className="border-t-2 py-3 whitespace-nowrap px-2 text-sm text-gray-600">
                <p>✔ Track Product</p>
                <p>✔ Secure checkout</p>
                <p>✔ 30-day return policy</p>
              </div>

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

          </div>

          {/* PRODUCT TITLE */}

          {/* PRODUCT DESCRIPTION */}
<div className="mt-6 px-3">
  <h2 className="text-2xl font-bold mb-3 text-gray-800">Product Description</h2>
  <p className="text-gray-700 leading-relaxed text-base">{product.description || "No description available."}</p>
</div>

{/* SPECIFICATIONS */}
{product.specifications && product.specifications.length > 0 && (
  <div ref={specificationsRef} className="mt-8 px-3">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Specifications</h2>
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="w-full text-left divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {product.specifications.map((spec, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-4 py-2 font-medium text-gray-700">{spec.key}</td>
              <td className="px-4 py-2 text-gray-600">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{/* Key Features */}

{product.key_features && product.key_features.length > 0 && (
  <div ref={keyFeaturesRef} className="mt-8 px-3">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Key Features</h2>
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="w-full text-left divide-y divide-gray-200">
        <tbody className="bg-white divide-y divide-gray-200">
          {product.key_features.map((spec, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-4 py-2 font-medium text-gray-700">{spec.key}</td>
              <td className="px-4 py-2 text-gray-600">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


{/* REVIEWS */}
<div className="mt-10 px-3">
  <h2 className="text-2xl font-bold mb-5 text-gray-800">Customer Reviews</h2>

  {/* Review Input */}
  <div className="border rounded-lg p-5 shadow-sm mb-8 bg-white">
    <div className="flex items-center gap-2 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          onClick={() => setRating(star)}
          className={`cursor-pointer text-2xl ${
            rating >= star ? "text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
    <textarea
      className="w-full border rounded-md p-3 mb-4 text-gray-700 focus:ring-2 focus:ring-orange-400 focus:outline-none"
      placeholder="Write your review..."
      value={comment}
      onChange={(e) => setComment(e.target.value)}
    />
    <button
  onClick={submitReview}
  disabled={submitting}
  className={`bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2 rounded-md transition flex items-center justify-center ${
    submitting ? "opacity-70 cursor-not-allowed" : ""
  }`}
>
  {submitting ? (
    <svg
      className="animate-spin h-5 w-5 mr-2 text-white"
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
        d="M4 12a8 8 0 018-8v8z"
      ></path>
    </svg>
  ) : null}
  {submitting ? "Submitting" : "Submit Review"}
</button>
  </div>

  {/* Reviews List */}
  <div className="space-y-5 px-3">
  {loadingReviews ? (
    // Skeleton while loading
    Array(3)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="border rounded-lg p-4 bg-white shadow-sm animate-pulse flex gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 rounded w-full"></div>
          </div>
        </div>
      ))
  ) : reviews.length > 0 ? (
    <>
      {reviews.slice(0, visibleCount).map((rev) => (
        <div key={rev.id} className="border rounded-lg p-4 bg-white shadow-sm flex gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
            {rev.user.first_name[0]}
          </div>

          {/* Review Content */}
          <div className="flex-1">
            <p className="font-medium text-gray-800">
              {rev.user.first_name} {rev.user.last_name?.[0]}.
            </p>

            <div className="flex items-center gap-1 mt-1">
              {[...Array(rev.rating)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-lg" />
              ))}
            </div>

            <p className="text-gray-700 mt-2">{rev.comment}</p>
          </div>
        </div>
      ))}

      {/* Invisible div to trigger infinite scroll */}
      <div ref={loadMoreRef}></div>

      {/* Message when all reviews are loaded */}
      {visibleCount >= reviews.length && (
        <p className="text-center text-gray-500 mt-4 text-xs">All reviews loaded.</p>
      )}
    </>
  ) : (
    <p className="text-gray-500 italic">
      No reviews yet. Be the first to review this product!
    </p>
  )}
</div>


</div>

  <RelatedProducts products={products} />
  <RecentlyViewed products={products} setProducts={setProducts} />
        </div>


        {/* RIGHT SIDEBAR */}
      <div className="border p-6  rounded-lg h-full sm:h-[530px] bg-white text-gray-900 sm:w-80 w-full flex flex-col justify-between shadow-lg">
      
      {/* PRODUCT DETAILS */}
      <div>
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
          Product Details
        </h2>

        <div className="space-y-4 text-sm">
          <p>
            <span className="font-semibold">Location:</span> {product.location || "No Available"}
          </p>
          <p>
            <span className="font-semibold">Brand:</span> {product.brand_name || "No Available"}
          </p>
          <p>
            <span className="font-semibold">Availability: </span>
            <span className={product.stock > 0 ? "text-green-400" : "text-red-500"}>
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </p>
          <p>
            <span className="font-semibold">Stock:</span> {product.stock}
          </p>
          <p>
            <span className="font-semibold">Delivery Day:</span> {product.delivery_time || "-"}
          </p>
          
          <p>
            <span className="font-semibold">Company Type:</span> {product.company_type || "-"}
          </p>
          <p className="capitalize">
            <span className="font-semibold capitalise">Delivery Method:</span> {product.delivery_method ? product.delivery_method.replace("_", " ") : "Not Available"}
          </p>
          <p>
            <span className="font-semibold">Delivery Price:</span>{" "}
            {product.delivery_price ? (
              <>
                {formatCurrency(product.delivery_price, product.currency || "NGN")}
              </>
            ) : (
              "-"
            )}
          </p>
        </div>
      </div>


      <div className="mt-4 space-y-2 mt-10">
      {product.specifications?.length > 0 && (
        <button
          onClick={() => specificationsRef.current.scrollIntoView({ behavior: "smooth" })}
          className=" px-6 text-left px-3 py-2 border-2 round rounded-md text-gray-800 font-medium transition"
        >
          Specifications Details
        </button>
      )}
      {product.key_features?.length > 0 && (
        <button
          onClick={() => keyFeaturesRef.current.scrollIntoView({ behavior: "smooth" })}
          className=" px-6 text-left px-3 py-2 border-2 round rounded-md text-gray-800 font-medium transition"
        >
          Key Features Details
        </button>
      )}
    </div>

      {/* ADD TO CART BUTTON  {key.replace("_", " ")}*/}
      
      <button
        onClick={() => addToCart(product)}
        className="mt-6 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all"
      >
        Add To Wishlist
      </button>

    </div>

      </div>
    </div>
  );
}