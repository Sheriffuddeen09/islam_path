import {Trash2, Loader2, Download, Eye } from "lucide-react";
import ImageGridLibrary from "./ImageGridLibrary";
import { useState } from "react";
import { useAuth } from "../../layout/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import DownloadImageFlex from "./DownloadImageFlex";
import toast from "react-hot-toast";
import ImageGridLibraryPreview from "./ImageGridLibraryPreview";

export default function Library({post, handleRemove, deleteLoading, downloading}){

const [showMore, setShowMore] = useState(false);

const {user} = useAuth()
const [showImagePicker, setShowImagePicker] = useState(false);
const [showContentModal, setShowContentModal] = useState(false);



const handleDownloadVideo = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:8000/api/download/video/${post.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // ✅ FORCE DEFAULT FILE NAME
    link.download = "IPK video.mp4";

    document.body.appendChild(link);
    link.click();
    link.remove();

    toast.success("Downloading video...", "success" );
  } catch (err) {
    console.error(err);
    toast.error("Failed to download video!", "error");
  }
};


  const [progressMap, setProgressMap] = useState({});
  
  const downloadSingleImage = async (img) => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await api.get(`/api/download/image/${img.id}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        onDownloadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgressMap((prev) => ({ ...prev, [img.id]: percent }));
        },
      });
  
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = img.path?.split("/").pop() || "image.jpg";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      toast.error("Failed to download image", 'error');
    }
  };
  
  
  


const text = post.content || "";

const hasMedia = post.media?.some(
  media => media.type === "image" || media.type === "video"
);

// Different limits depending on whether there is media
const contentLimit = hasMedia ? 22 :560;

const shouldShowMore = text.length > contentLimit;

const shortText = shouldShowMore
  ? text.substring(0, contentLimit) + "..."
  : text;

const media = post.media?.[0];

return (
  <>
    {/* ================= /text CARD ================= */}
    <div
      className="
        bg-[var(--bg-color)]
        text-[var(--text-color)]
        border border-blue-500
        relative
        h-64
        p-2
      "
    >
      {/* USER HEADER */}
      <div className="flex items-center gap-1">
        <Link to={`/profile/${post.user?.id}`}>
          <p
            className="
              font-bold
              text-white
              pb-1
              bg-black
              text-[40px]
              rounded-full
              w-12
              h-12
              text-center
              flex
              flex-col
              items-center
              justify-center
            "
          >
            {post.user?.first_name?.[0]}
          </p>
        </Link>

        <div>
          <Link to={`/profile/${post.user?.id}`}>
            <p className="font-semibold">
              {post.user?.first_name} {post.user?.last_name}
            </p>
          </Link>

          <p className="text-xs">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* =================   CONTENT ================= */}
      {post.content && (
        <div className="px-3 pb-2 font-semibold break-words whitespace-normal
         text-[10px]">
          <p className="px-2">
            {shouldShowMore ? shortText : text}

            {shouldShowMore && (
              <button
                type="button"
                onClick={() => setShowContentModal(true)}
                className="
                  ml-1
                  text-blue-600
                  font-bold
                  hover:text-blue-800
                  hover:underline
                "
              >
                See more
              </button>
            )}
          </p>
        </div>
      )}

      {/* ================= IMAGES ================= */}
      <div className="px-1">
        {post.media?.some(m => m.type === "image") && (
          <ImageGridLibrary
            media={post.media.filter(m => m.type === "image")}
            postId={post.id}
          />
        )}

        {/* ================= VIDEO ================= */}
        {media?.type === "video" && (
          <video
            src={`http://localhost:8000/api/video/stream/${post.id}`}
            className="w-full h-40 object-cover"
            controls
            playsInline
          />
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="absolute top-2 right-2 inline-flex items-center gap-2">

        {/* Views */}
        {post.media?.some(m => m.type === "video") && (
          <p className="text-black p-1 text-center rounded-lg bg-gray-200 text-xs">
            <Eye /> {post.views || 0}
          </p>
        )}

        {/* Delete */}
        <button
          onClick={() => handleRemove(post.id)}
          className="rounded hover:bg-gray-200"
          title="Remove"
          disabled={deleteLoading === post.id}
        >
          {deleteLoading === post.id ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
          ) : (
            <Trash2 className="w-4 h-4 text-red-600" />
          )}
        </button>

        {/* Video Download */}
        {post.media?.some(m => m.type === "video") && (
          <button
            onClick={handleDownloadVideo}
            className="p-1 rounded hover:bg-gray-200"
          >
            {downloading === post.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Download className="w-4 h-4 text-blue-600" />
            )}
          </button>
        )}

        {/* Image Download */}
        {post.media?.some(m => m.type === "image") && (
          <button
            onClick={() => setShowImagePicker(true)}
            className="
              flex
              items-center
              gap-2
              font-bold
              text-[15px]
              px-2
              py-2
              hover:text-gray-600
              text-gray-800
              hover:bg-gray-50
              rounded
            "
          >
            {downloading === post.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Download className="w-4 h-4 text-blue-600" />
            )}
          </button>
        )}
      </div>
    </div>



    {showContentModal && (
      <div
        className="
          fixed
          inset-0
          bg-black/70
          z-[9999]
          flex
          items-center
          justify-center
          p-4
        "
        onClick={() => setShowContentModal(false)}
      >

        <div
          className="
            bg-[var(--bg-color)]
            text-[var(--text-color)]
            scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
            rounded-2xl
            shadow-2xl
            w-full
            max-w-2xl
            max-h-[90vh]
            overflow-hidden
            flex
            flex-col
          "
          onClick={e => e.stopPropagation()}
        >

          {/* ================= MODAL HEADER ================= */}
          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-4
              border-b
            "
          >
            <div className="flex items-center gap-3">

              <Link to={`/profile/${post.user?.id}`}>
                <div
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-black
                    text-white
                    flex
                    items-center
                    justify-center
                    text-xl
                    font-bold
                  "
                >
                  {post.user?.first_name?.[0]}
                </div>
              </Link>

              <div>
                <p className="font-bold">
                  {post.user?.first_name} {post.user?.last_name}
                </p>

                <p className="text-xs">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>

            </div>

            {/* CLOSE */}
            <button
              type="button"
              onClick={() => setShowContentModal(false)}
              className="
                w-9
                h-9
                rounded-full
                bg-gray-200
                hover:bg-gray-300
                flex
                items-center
                justify-center
                text-gray-700
                text-lg
              "
            >
              ✕
            </button>
          </div>


          {/* ================= MODAL CONTENT ================= */}
          <div className="overflow-y-auto
          scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
           p-5">

            {/* FULL TEXT */}
            {post.content && (
              <div
                className="
                  mb-5
                  text-sm
                  leading-6
                  whitespace-pre-wrap
                  break-words
                "
              >
                {post.content}
              </div>
            )}


            {/* ================= ALL IMAGES ================= */}
            {post.media?.some(m => m.type === "image") && (
              <div className="mb-5">

                <ImageGridLibraryPreview
                  media={post.media.filter(
                    m => m.type === "image"
                  )}
                  postId={post.id}
                />

              </div>
            )}


            {post.media?.some(m => m.type === "video") && (
              <div className="mb-5">

                <video
                  src={`http://localhost:8000/api/video/stream/${post.id}`}
                  className="
                    w-full
                    max-h-[65vh]
                    object-contain
                    rounded-xl
                    bg-black
                  "
                  controls
                  playsInline
                />

              </div>
            )}

          </div>


          {/* ================= MODAL FOOTER ================= */}
          <div
            className="
              border-t
              px-5
              py-3
              flex
              justify-end
            "
          >
            <button
              type="button"
              onClick={() => setShowContentModal(false)}
              className="
                px-5
                py-2
                bg-blue-600
                hover:bg-blue-700
                text-white
                rounded-lg
                font-semibold
              "
            >
              Close
            </button>
          </div>

        </div>
      </div>
    )}


    {/* ================= IMAGE DOWNLOAD MODAL ================= */}

    {showImagePicker && (
      <div
        className="
          fixed
          inset-0
          bg-black/70
          z-50
          flex
          items-center
          justify-center
          p-4
        "
      >
        <div
          className="
            bg-white
            relative
            rounded-lg
            p-4
            w-80
            max-h-[80vh]
            overflow-y-auto
          "
        >

          <button
            onClick={() => setShowImagePicker(false)}
            className="
              absolute
              right-3
              top-4
              text-black
              rounded-full
              hover:text-gray-700
              hover:bg-gray-50
              bg-gray-100
              transition
              w-6
              h-6
              flex
              items-center
              justify-center
            "
          >
            ✕
          </button>

          <h2 className="font-bold mb-3">
            Select image to download
          </h2>

          {post.media.some(m => m.type === "image") && (
            <div className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded">

              <DownloadImageFlex
                downloadSingleImage={downloadSingleImage}
                progressMap={progressMap}
                media={post.media.filter(
                  m => m.type === "image"
                )}
              />

            </div>
          )}

        </div>
      </div>
    )}
  </>
);
}