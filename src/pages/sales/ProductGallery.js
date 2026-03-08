import { useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/styles.min.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function ProductGallery({ images }) {

  const baseURL = "http://localhost:8000/storage/";
  const [active,setActive] = useState(0);

  if(!images || images.length === 0){
    return <img src="/placeholder.png" alt="No product"/>
  }

  return (

    <div className="w-full overflow-hidden">

      {/* MAIN IMAGE */}
        <div className="max-w-md">

          <InnerImageZoom
            src={`${baseURL}${images[active].image_path}`}
            zoomSrc={`${baseURL}${images[active].image_path}`}
            zoomType="hover"
          />

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