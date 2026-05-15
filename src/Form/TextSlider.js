import { useEffect, useState } from "react";

export default function TextSlider({ texts }) {

  
  const [index, setIndex] = useState(0);
  const total = texts.length;

  useEffect(() => {
    const autoSlide = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 3000);

    return () => clearInterval(autoSlide);
  }, [total]);

  return (
    <div className="relative h-[110px] md:h-[140px] px-2 py-4 overflow-hidden  ">
      {/* SLIDES */}
      <div
        className="flex h-full transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {texts.map((text, i) => (
          <div key={i} className=" min-w-full sm:text-lg font-bold  h-full text-center p-2 text-sm mx-auto ">
           {text.title}
          </div>
        ))}
      </div>

      {/* DOTS */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-2">
        {texts.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-blue-600 w-3 " : "bg-white"
            } transition-all duration-300`}
          />
        ))}
      </div>

      {/* COUNTER BOX */}
    </div>
  );
}
