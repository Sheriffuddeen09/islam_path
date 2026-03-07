import { useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function ProductGallery({ images }) {

  const [active,setActive] = useState(0)

  const baseURL = "http://localhost:8000/storage/"

  return (

    <div>

      {/* ZOOM IMAGE */}
      <InnerImageZoom
        src={`${baseURL}${images[active].image_path}`}
        zoomSrc={`${baseURL}${images[active].image_path}`}
        zoomType="hover"
        className="rounded"
      />

      {/* THUMBNAILS */}
      <Swiper
        slidesPerView={4}
        spaceBetween={10}
        className="mt-4"
      >

        {images.map((img,i)=>{

          const url = `${baseURL}${img.image_path}`

          return (

            <SwiperSlide key={img.id}>

              <img
                src={url}
                onClick={()=>setActive(i)}
                className={`cursor-pointer h-20 w-full object-cover rounded border-2
                ${active===i ? "border-orange-500":"border-gray-200"}`}
              />

            </SwiperSlide>

          )

        })}

      </Swiper>

    </div>
  )
}