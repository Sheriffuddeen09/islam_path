import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../../layout/image/favicon.png'
import PostOptions from "./PostOption";

export default function ReplyImageSlider({ images = [], post }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate()


  if (!images.length) return null;

  const next = () => setIndex(i => (i + 1) % images.length);
  const prev = () => setIndex(i => (i - 1 + images.length) % images.length);


  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={images[index]}
        alt="post"
        className="h-full w-96 object-contain"
      />

      {images.length > 1 && (
        <>

        {/* large screen */}

        <button
            onClick={next}
             className="absolute left-4 sm:block hidden"
          >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="bg-transparent size-14 rotate-90 bg-black/50 w-10 h-10 border-2 hover:bg-gray-100 hover:text-gray-600 border-white rounded-full text-white rounded-full">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
          </button>

          <button
            onClick={prev}
             className="absolute  right-8 sm:block hidden"
          >
            
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="bg-transparent size-14 rotate-90 bg-black/50 w-10 h-10 border-2 hover:bg-gray-100 hover:text-gray-600 border-white rounded-full text-white rounded-full">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          </svg>
          </button>


          <div className="absolute top-4 right-4">
          <div className="inline-flex items-center gap-6">
            <p className="bg-white text-black text-xs px-2 py-2 font-bold 
            rounded-full">
            {index + 1} / {images.length}
            </p>
            <div className="bg-white rounded-full">  
            <PostOptions post={post} />
            </div>
            </div>
          </div>

          <div
          onClick={() => navigate('/')}
          className="absolute top-4 left-4"
          >
            <div className="inline-flex gap-12 items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-12 bg-white text-black text-xs px-2 py-2 font-bold rounded-full hover:text-gray-700 hover:bg-gray-100 bg-gray-200 transition 
            w-10  h-10 cursor-pointer">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>

            <img onClick={() => navigate('/')} src={logo} alt="IPK" className="w-10 h-10 cursor-pointer" />
          </div>
          </div>
        </>
      )}
    </div>
  );
}
