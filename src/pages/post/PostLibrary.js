import { useEffect, useState } from "react";
import api from "../../Api/axios";
import Library from "./Library";


import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


export default function PostLibrary() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null); // NEW ✔v
  const [downloading, setDownLoading] = useState(null); // NEW ✔v
 


  useEffect(() => {
  let mounted = true;

  const fetchLibrary = async () => {
    try {
      const res = await api.get("/api/post/library", { withCredentials: true });

      if (mounted) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error("Library fetch failed:", err);
    } finally {
      if (mounted) {
        setLoading(false); // ✅ THIS WAS MISSING
      }
    }
  };

  fetchLibrary();

  window.addEventListener("focus", fetchLibrary);

  return () => {
    mounted = false;
    window.removeEventListener("focus", fetchLibrary);
  };
}, []);



  const handleRemove = async (postId) => {
    setDeleteLoading(postId); // start loading for this post

    try {
      await api.delete(`/api/post/library/${postId}`, { withCredentials: true });
      setPosts(prev => prev.filter(v => v.id !== postId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(null); // stop loading
    }
  };

  

  if (loading) {
  return (
    <div className="lg:ml-64">
      {/* Header skeleton */}
      <div className="px-4">
        <Skeleton
          height={32}
          width={140}
          className="mb-4"
        />
      </div>

      {/* Library card skeletons */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="relative border rounded-xl overflow-hidden"
          >
            {/* Image/video skeleton */}
            <Skeleton
              height={220}
              width="100%"
            />

            <div className="p-3">
              {/* Title */}
              <Skeleton
                height={18}
                width="70%"
                className="mb-2"
              />

              {/* Description */}
              <Skeleton
                height={14}
                width="90%"
                className="mb-1"
              />

              <Skeleton
                height={14}
                width="60%"
                className="mb-3"
              />

              {/* Buttons */}
              <div className="flex gap-2">
                <Skeleton
                  height={32}
                  width={80}
                />

                <Skeleton
                  height={32}
                  width={80}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

    if (!posts.length) {
    return (
      <div className="p-6 text-start border-b-2 border-blue-600 flex flex-col justify-center items-center  
      text-[var(--text-color)] text-3xl font-bold">
        Library is Empty.
      </div>
    );
  }
  const content = (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3  gap-4">
      {posts.map(post => (
        <div
          key={post.id}
          className="relative border rounded-xl overflow-hidden hover:shadow-xl transition"
        >
         <Library post={post} handleRemove={handleRemove}
         deleteLoading={deleteLoading} downloading={downloading} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="lg:ml-64 ">
      <h1 className="text-[var(--text-color)] text-xl border-b-2 border-blue-600 pb-2 font-bold">Library</h1>
      {content}
    </div>
  )
}
