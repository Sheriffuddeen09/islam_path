import { Heart, MessageSquare, Trash2, Loader2, Download } from "lucide-react";
import ImageGridLibrary from "./ImageGridLibrary";
import PostVideoCardLibrary from "./PostVideoCardLibrary";
import { useState } from "react";
import { useAuth } from "../../layout/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
export default function Library({post, handleDownload, handleRemove, deleteLoading, downloading}){

const [showMore, setShowMore] = useState(false);

const {user} = useAuth()

const navigate = useNavigate()

 const text = post.content || "";
 const shortText = text.length > 350 ? text.substring(0, 350) + "....." : text;

const media = post.media?.[0];


    return (
        <div className="bg-white relative h-72 p-2">
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
                    showMore ? "" : 
                    <button onClick={() => navigate(`/post/text/${post.id}`)}> ..See more</button>
                    
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
          


        {/* {media?.type === "image" && (
          <img
            src={`${api}/storage/${media.path}`}
            alt=""
            className="w-full h-full object-cover"
          />
        )} */}

        {media?.type === "video" && (
          <video
            src={`${api}/api/video/stream/${post.id}`}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        )}


              {/* Video */}
          
                  {/* {post.media
                    .filter(m => m.type === "video")
                    .map(m => (
              
                      <PostVideoCardLibrary v={m}  post={post} />
              
                    ))
                  } */}
          
          </div>

          {/* Delete Button with Loading */}
          <button
            onClick={() => handleRemove(post.id)}
            className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200"
            title="Remove"
            disabled={deleteLoading === post.id} // disable when loading
          >
            {deleteLoading === post.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-600" />
            )}
          </button>
              {post.media && post.media.length > 0 && (
          <button
            onClick={() => handleDownload(post)}
            className="absolute top-2 right-12 p-1 rounded hover:bg-gray-200"
            title="Download"
           
          >
            {downloading === post.id ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Download className="w-4 h-4 text-blue-600" />
            )}
          </button>
              )}
        </div>
    )
}