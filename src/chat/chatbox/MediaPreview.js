import { useEffect, useRef } from "react";

export default function MediaPreview({
  preview,
  setPreview,
}) {
  const { items, index } = preview;

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = () => {
    setPreview((p) => ({
      ...p,
      index: (p.index + 1) % p.items.length,
    }));
  };

  const prev = () => {
    setPreview((p) => ({
      ...p,
      index:
        (p.index - 1 + p.items.length) %
        p.items.length,
    }));
  };

  const current = items[index];

  // ESC CLOSE
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setPreview({
          items: [],
          index: 0,
        });
      }
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKey
      );
  }, []);

  if (!preview.items.length) return null;

  // TOUCH START
  const handleTouchStart = (e) => {
    touchStartX.current =
      e.changedTouches[0].screenX;
  };

  // TOUCH END
  const handleTouchEnd = (e) => {
    touchEndX.current =
      e.changedTouches[0].screenX;

    const diff =
      touchStartX.current -
      touchEndX.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        next(); // slide left → next
      } else {
        prev(); // slide right → previous
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">

      {/* CLOSE */}
      <button
        className="absolute top-4 right-4 text-white z-50"
        onClick={() =>
          setPreview({
            items: [],
            index: 0,
          })
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* PREVIOUS - Desktop only */}
      {items.length > 1 && (
        <button
          onClick={prev}
          className="hidden md:flex absolute left-4 text-white z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* MEDIA */}
      <div
        className="w-full h-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
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
      </div>

      {/* NEXT - Desktop only */}
      {items.length > 1 && (
        <button
          onClick={next}
          className="hidden md:flex absolute right-4 text-white z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
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