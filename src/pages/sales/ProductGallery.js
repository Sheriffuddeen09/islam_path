import { useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Star } from "lucide-react";
import { useCart } from "./cart/CartContext";


export default function ProductGallery({ images, product }) {

   const { addToCart } = useCart();


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
    onClick={()=>addToCart(product)}
    className="mt-6 w-full bg-black text-white py-3 rounded hover:bg-orange-600"
  >
    Add To Cart
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