import { useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Star } from "lucide-react";
import { useCart } from "./cart/CartContext";


export default function ProductGallery({ images, product }) {

   const { addToCart, loading } = useCart();


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


      </div>
      {/* THUMBNAILS */}
      <div className="w-full min-w-0">

        <Swiper
          spaceBetween={8}
          slidesPerView="auto"
          className="mt-4 w-full"
        >

          {images.map((img,i)=>{

            const url = `${baseURL}${img.image_path}`;

            return(

              <SwiperSlide
                key={img.id}
                className="!w-20"
              >

                <img
                  src={url}
                  alt=""
                  onClick={()=>setActive(i)}
                  className={`w-28 h-24 object-cover rounded cursor-pointer border-2
                  ${active === i ? "border-orange-500":"border-gray-200"}`}
                />

              </SwiperSlide>

            )

          })}

        </Swiper>

      </div>

    </div>

  )
}