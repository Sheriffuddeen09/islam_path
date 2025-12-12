import { useState } from "react";
import { X } from "lucide-react";

export default function CommentImage({ image }) {
  const [open, setOpen] = useState(false);

  if (!image) return null;

  const src = `${`http://localhost:8000`}/storage/${image}`;

  return (
    <>
      {/* Thumbnail */}
      <img
        src={src}
        className="w-24 h-24 rounded object-cover mt-2 cursor-pointer"
        alt="comment image"
        onClick={() => setOpen(true)}
      />

      {/* Modal for full image */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-80 z-50"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image */}
          <img
            src={src}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded"
            alt="full comment"
          />
        </div>
      )}
    </>
  );
}
