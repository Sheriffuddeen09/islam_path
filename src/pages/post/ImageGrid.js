




import { useState } from "react";
import PostOptions from "./PostOption";
import { useRef } from "react";

export default function PostImageGridProfile({ media = [], post, chats}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);



  if (!media.length) return null;

  const total = media.length;

  const openPreview = (i) => {
    setIndex(i);
    setOpen(true);
  };

  // 1 IMAGE → FULL WIDTH
  if (!media || media.length === 0) return null;

if (total === 1 && media[0]) {

    return (
      <>
        <img
          src={media[index]?.url}
          className="w-full max-h-[450px] object-cover rounded cursor-pointer"
          onClick={() => openPreview(0)}
        />
        <PreviewModal open={open} setOpen={setOpen} media={media} index={index} setIndex={setIndex}  />
      </>
    );
  }

  // 2 IMAGES → 2 GRID
  if (total === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 w-full">
          {media.map((img, i) => (
            <>
            {media[index] &&(
            <img
              key={img.id}
              src={img?.url}
              className="h-44 border w-full rounded cursor-pointer"
              onClick={() => openPreview(i)}
            />
          )
            }

           </>
          ))}
            <PreviewModal open={open} setOpen={setOpen} media={media} index={index} setIndex={setIndex}/>
        </div>
        
      </>
    );
  }

  // 3 IMAGES → 2 / 1 LAYOUT
  if (total === 3) {
    return (
      <>
        <div className="grid grid-cols-2 gap-1 w-full">
          <img
            src={media[0].url}
            className="row-span-2 h-full w-full rounded cursor-pointer"
            onClick={() => openPreview(0)}
          />
          {media.slice(1).map((img, i) => (
            <>
            <img
              key={img.id}
              src={img.url}
              className="h-32 border w-full rounded cursor-pointer"
              onClick={() => openPreview(i + 1)}
            />
           </>
          ))}
            <PreviewModal open={open} setOpen={setOpen} media={media} index={index} setIndex={setIndex}/>
        </div>
        
      </>
    );
  }

  // 4+ IMAGES → 2x2 + REMAINING
  const visible = media.slice(0, 4);
  const remaining = total - 4;

  return (
    <>
      <div className="grid grid-cols-2 gap-1 w-full">
        {visible.map((img, i) => (
          <>
          <div
            key={img.id}
            className="relative h-44 cursor-pointer"
            onClick={() => openPreview(i)}
          >
            <img
              src={img.url}
              className="h-full w-full object-cover rounded"
            />
            {i === 3 && remaining > 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                <span className="text-white text-2xl font-bold">+{remaining}</span>
              </div>
            )}
          </div>
      </>
        ))}
      <PreviewModal open={open} setOpen={setOpen} media={media} index={index} setIndex={setIndex}/>
      </div>
  
    
    </>
  );


function PreviewModal({
    open,
    setOpen,
    media,
    index,
    setIndex,
    post,
    chats
}) {
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    if (!open || !media || !media[index]) {
        return null;
    }

    const current = media[index];

    const goPrevious = () => {
        setIndex(i => Math.max(i - 1, 0));
    };

    const goNext = () => {
        setIndex(i =>
            Math.min(i + 1, media.length - 1)
        );
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];

        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) {
            return;
        }

        const touch = e.changedTouches[0];

        const deltaX =
            touch.clientX - touchStartX.current;

        const deltaY =
            touch.clientY - touchStartY.current;

        // Reset
        touchStartX.current = null;
        touchStartY.current = null;

        // Ignore mostly vertical movements
        if (
            Math.abs(deltaX) <
            Math.abs(deltaY)
        ) {
            return;
        }

        // Minimum swipe distance
        if (Math.abs(deltaX) < 50) {
            return;
        }

        // Swipe left = NEXT
        if (deltaX < 0) {
            goNext();
        }

        // Swipe right = PREVIOUS
        if (deltaX > 0) {
            goPrevious();
        }
    };

    return (
        <div
            className="
                fixed
                inset-0
                bg-black/80
                z-50
                flex
                items-center
                justify-center
            "
        >

            {/* TOP RIGHT */}

            <div
                className="
                    absolute
                    top-4
                    right-4
                    inline-flex
                    items-center
                    gap-4
                    z-50
                "
            >

                {/* CLOSE */}

                <button
                    type="button"
                    className="
                        text-black
                        bg-white
                        rounded-full
                        w-10
                        h-10
                        text-xl
                        flex
                        items-center
                        justify-center
                    "
                    onClick={() =>
                        setOpen(false)
                    }
                >
                    ✕
                </button>


                {/* OPTIONS */}

                <div className="bg-white rounded-full">
                    <PostOptions
                        post={post}
                        chats={chats}
                    />
                </div>

            </div>


            {/* PREVIOUS - DESKTOP ONLY */}

            {index > 0 && (
                <button
                    type="button"
                    className="
                        hidden
                        md:flex
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        w-10
                        h-10
                        border-2
                        rounded-full
                        items-center
                        justify-center
                        pb-2
                        hover:bg-gray-800
                        text-white
                        text-3xl
                        z-40
                    "
                    onClick={goPrevious}
                >
                    ‹
                </button>
            )}


            {/* IMAGE / SWIPE AREA */}

            <div
                className="
                    max-w-[90vw]
                    max-h-[80vh]
                    flex
                    items-center
                    justify-center
                    touch-pan-y
                    select-none
                "
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >

                <img
                    src={current.url}
                    alt=""
                    draggable={false}
                    className="
                        max-h-[80vh]
                        max-w-[90vw]
                        object-contain
                        select-none
                        pointer-events-none
                    "
                />

            </div>


            {/* NEXT - DESKTOP ONLY */}

            {index < media.length - 1 && (
                <button
                    type="button"
                    className="
                        hidden
                        md:flex
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        w-10
                        h-10
                        border-2
                        rounded-full
                        items-center
                        justify-center
                        pb-2
                        hover:bg-gray-800
                        text-white
                        text-3xl
                        z-40
                    "
                    onClick={goNext}
                >
                    ›
                </button>
            )}

        </div>
    );
}
}