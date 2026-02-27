import { useState } from "react";
import PostOptions from "./PostOption";

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

  function PreviewModal({ open, setOpen, media, index, setIndex }) {
  if (!open || !media || !media[index]) return null;

  const current = media[index];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="absolute top-4 right-4 inline-flex items-center gap-4">
        <button
          className="text-black bg-white rounded-full w-10 h-10 text-xl"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      <div className="bg-white rounded-full">
       <PostOptions post={post} chats={chats} />
      </div>
      </div>

       <button
            className="absolute left-4  w-8 h-8 border-2 rounded-full flex items-center justify-center pb-2 hover:bg-gray-800 text-white text-2xl"
            onClick={() => setIndex(i => Math.max(i - 1, 0))}
          >
            ‹
          </button>

      <img
        src={current.url}
        className="max-h-[80vh] max-w-[90vw] object-contain"
      />

      <button
            className="absolute right-4 w-8 h-8 border-2 rounded-full flex items-center justify-center pb-2 hover:bg-gray-800 text-white text-2xl"
            onClick={() => setIndex(i => Math.min(i + 1, media.length - 1))}
          >
          ›
        </button>
    
            </div>
  );
}

}

