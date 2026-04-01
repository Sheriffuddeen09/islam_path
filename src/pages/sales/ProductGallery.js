import { useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import "swiper/css";
import { Star } from "lucide-react";
import { useCart } from "./cart/CartContext";


export default function ProductGallery({ images, isOwner, product }) {

   const { addToCart, loading } = useCart();
   const [showPreview, setShowPreview] = useState(false);

  const baseURL = "http://localhost:8000/storage/";
  const [active,setActive] = useState(0);

  if(!images || images.length === 0){
    return <img src="/placeholder.png" alt="No product"/>
  }


  return (

    <div className="w-full overflow-hidden">

      {/* MAIN IMAGE */}

<div className="max-w-md sm:max-w-xl inline-flex gap-6">

  <InnerImageZoom
    src={`${baseURL}${images[active].image_path}`}
    zoomSrc={`${baseURL}${images[active].image_path}`}
    zoomType="hover"
  />

  {/* PRODUCT INFO */}
  <div className="hidden sm:flex mt-6 flex-col gap-3">

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
        ({product.reviews_count} reviews)
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
        className={`mt-2 w-full bg-orange-600 text-white py-2 rounded-lg font-semibold transition flex items-center justify-center
          ${
            product.stock <= 0 || loading || isOwner
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-orange-700"
          }`}
        disabled={product.stock <= 0 || loading || isOwner}
        onClick={() => addToCart(product)}
      >
        {isOwner ? (
          "Your Product"
        ) : loading ? (
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


      </div>
      {/* THUMBNAILS */}
     <div className="w-80 sm:w-96 mx-auto sm:mx-0 no-scrollbar overflow-x-auto mt-4">
  <div className="flex gap-2 w-max">
    {images.map((img, i) => {
      const url = `${baseURL}${img.image_path}`;

      return (
        <img
          key={img.id}
          src={url}
          alt=""
          onClick={() => {
            setActive(i);
            setShowPreview(true);
          }}
          className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition
          ${active === i ? "border-orange-500" : "border-gray-200"}`}
        />
      );
    })}
  </div>
</div>

{showPreview && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

    {/* Close Button */}
    <button
      onClick={() => setShowPreview(false)}
      className="absolute top-5 right-5 text-white text-3xl font-bold hover:text-gray-300"
    >
      ✕
    </button>

    {/* Previous Button */}
    {active > 0 && (
      <button
        onClick={() => setActive((prev) => prev - 1)}
        className="absolute left-5 text-white text-3xl bg-black/50 p-1 rounded-full hover:bg-black/70"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>

      </button>
    )}

    {/* Image */}
    <img
      src={`${baseURL}${images[active]?.image_path}`}
      className="max-w-[90%] max-h-[80%] rounded-lg shadow-lg transition"
    />

    {/* Next Button */}
    {active < images.length - 1 && (
      <button
        onClick={() => setActive((prev) => prev + 1)}
        className="absolute right-6 text-white text-3xl bg-black/50 p-1 rounded-full hover:bg-black/70"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      </svg>

      </button>
    )}

  </div>
)}
    </div>

  )
}