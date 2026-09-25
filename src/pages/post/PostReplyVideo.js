import { useState } from "react";
import { X } from "lucide-react";

export default function PostReplyVideo({ video }) {
  const [open, setOpen] = useState(false);

  if (!video) return null;

  const src = `http://localhost:8000/storage/${video}`;

  return (
    <>
      <video
        src={src}
        className="
          w-40
          h-32
          mx-auto
          rounded
          object-cover
          mt-2
          cursor-pointer
        "
        muted
        playsInline
        preload="metadata"
        onClick={() => setOpen(true)}
      />

      {open && (
        <div
          className="
            fixed
            inset-0
            bg-black/90
            flex
            items-center
            justify-center
            z-50
          "
          onClick={() => setOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="
              absolute
              top-5
              right-5
              text-white
              bg-black/50
              p-2
              rounded-full
              hover:bg-black/80
              z-50
            "
          >
            <X className="h-6 w-6" />
          </button>

          <video
            src={src}
            className="
              max-h-[90vh]
              max-w-[95vw]
              object-contain
              rounded
            "
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}