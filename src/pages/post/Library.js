import {Trash2, Loader2, Download } from "lucide-react";
import ImageGridLibrary from "./ImageGridLibrary";
import { useState } from "react";
import { useAuth } from "../../layout/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import DownloadImageFlex from "./DownloadImageFlex";
import Notification from "../../Form/Notification";

export default function Library({post, handleRemove, deleteLoading, downloading}){

const [showMore, setShowMore] = useState(false);
const [notify, setNotify] = useState("");

const {user} = useAuth()
const [showImagePicker, setShowImagePicker] = useState(false);

const showNotification = (message, type = "success") => {
    setNotify({ message, type });

    // Clear after 5 seconds
    setTimeout(() => {
      setNotify({ message: "", type: "" });
    }, 5000);
  };

const navigate = useNavigate()

 const text = post.content || "";
 const shortText = text.length > 350 ? text.substring(0, 350) + "..." : text;

const media = post.media?.[0];

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

    showNotification("Downloading video...", "success" );
  } catch (err) {
    console.error(err);
    showNotification("Failed to download video!", "error");
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
      showNotification("Failed to download image");
    }
  };
  
  
  



    return (
        <div className="bg-white relative h-64 no-scrollbar overflow-y-auto p-2">
            <div className="flex items-center  gap-3">
                    <Link to={`/profile/${user?.id}`}>
                    <p className="font-bold text-white pb-1 bg-black text-[40px] rounded-full w-12 h-12 text-center
                    flex flex-col items-center justify-center">
                      {post.user.first_name?.[0]}
                    </p>
                    </Link>
                    <div>
                      <Link to={`/profile/${user.id}`}>
                      <p className="font-semibold">{post.user.first_name} {post.user.last_name}</p>
                      </Link>
                      <p className="text-xs opacity-70">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
             <div
            className="p-4 text-black font-semibold text-[14px]" 
            onClick={() => navigate(`/post/text/${post.id}`)}>
            {post.content && (
              <p className="cursor-pointer px-2">
                {showMore
                ? text
                : shortText}
                {
                  showMore ? "" : <button onClick={(e) => {
                    e.preventDefault();
                    setShowMore(!showMore);
                  }}> See more</button>
                  
                }
                          
              </p>
            )}
          </div>
          
                {/* IMAGES */}
                <div className="px-1">
              {post.media.some(m => m.type === "image") && (
                <ImageGridLibrary
                  media={post.media.filter(m => m.type === "image")}
                  postId={post.id}
                />
              )}
          

              {/* Video */}

        {media?.type === "video" && (
        <video
          src={`http://localhost:8000/api/video/stream/${post.id}`}
          className="w-full h-40 object-cover"
          controls
          playsInline
        />
      )}

      
        
          
          </div>

          {/* Delete Button with Loading */}
          <div className="absolute top-2 right-2 inline-flex items-center gap-2">
            
          {post.media?.some(m => m.type === "video") && (
          <p className="text-black p-1 text-center rounded-lg bg-gray-200 text-xs">
            views {post.views || 0}
          </p>
            )}
         
          <button
            onClick={() => handleRemove(post.id)}
            className="rounded hover:bg-gray-200"
            title="Remove"
            disabled={deleteLoading === post.id} // disable when loading
          >
            {deleteLoading === post.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-600" />
            )}
          </button>
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


            {post?.media?.some(m => m.type === "image") && (
              <li>
                <button
                  onClick={() => 
                    setShowImagePicker(true)
                  }
                  className="flex items-center gap-2 font-bold text-[15px] w-full px-2 py-2 hover:text-gray-600 text-gray-800 hover:bg-gray-50 rounded"
                >
                  {downloading === post.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Download className="w-4 h-4 text-blue-600" />
                )}
                </button>
              </li>
            )}


          </div>

           {showImagePicker && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
              <div className="bg-white relative rounded-lg p-4 w-80 max-h-[80vh] overflow-y-auto">
                <button
                      onClick={() => setShowImagePicker(!showImagePicker)}
                      className="absolute right-3 top-4  text-black rounded-full hover:text-gray-700 hover:bg-gray-50 bg-gray-100 transition 
                      w-6 h-6 flex items-center justify-center"
                    >
                      ✕
          
                </button> 
                <h2 className="font-bold mb-3">Select image to download</h2>
          
                {post.media.some(m => m.type === "image") && (
                    <div
                      className="flex items-center gap-3 mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
                      
                    >
                      <DownloadImageFlex downloadSingleImage={downloadSingleImage} 
                      progressMap={progressMap}
                      media={post.media.filter(m => m.type === "image")} />
          
                    </div>
                  )}
              </div>
            </div>
          )}

          {notify.message && (
          <Notification
            message={notify.message}
            type={notify.type} // "success" = green, "error" = red
            onClose={() => setNotify({ message: "", type: "" })}
          />
        )}
              
        </div>
    )
}