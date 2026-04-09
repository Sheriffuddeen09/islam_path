import { useEffect } from "react";

export default function MediaPreview({ preview, setPreview }) {

  const { items, index } = preview;

  const next = () => {
    setPreview((p) => ({
      ...p,
      index: (p.index + 1) % p.items.length,
    }));
  };

  const prev = () => {
    setPreview((p) => ({
      ...p,
      index: (p.index - 1 + p.items.length) % p.items.length,
    }));
  };

  const current = items[index];

  // ESC key close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setPreview({ items: [], index: 0 });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!preview.items.length) return null;


  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">

      {/* CLOSE */}
      <button
        className="absolute top-4 right-4 text-white text-2xl"
        onClick={() => setPreview({ items: [], index: 0 })}
      >
        ✕
      </button>

      {/* PREV */}
      {items.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 text-white text-4xl"
        >
          ‹
        </button>
      )}

      {/* MEDIA DISPLAY */}
      {current.type === "image" ? (
        <img
          src={current.url}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      ) : (
        <video
          src={current.url}
          controls
          autoPlay
          className="max-h-[90vh] max-w-[90vw]"
        />
      )}

      {/* NEXT */}
      {items.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 text-white text-4xl"
        >
          ›
        </button>
      )}

      {/* COUNTER */}
      <div className="absolute bottom-4 text-white text-sm">
         {items.length > 1 && (
            <>
                {index + 1} / {items.length}
            </>
         )}
      </div>
    </div>
  );
}