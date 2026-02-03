import { useState } from "react";

export default function ReplyImageSlider({ images }) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={images[index]}
        alt="post"
        className="max-h-full max-w-full object-contain"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 bg-black/50 text-white rounded-full px-3 py-2"
          >
            ‹
          </button>

          <button
            onClick={next}
            className="absolute right-4 bg-black/50 text-white rounded-full px-3 py-2"
          >
            ›
          </button>

          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
