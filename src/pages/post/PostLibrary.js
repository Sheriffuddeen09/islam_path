import { useEffect, useState } from "react";
import api from "../../Api/axios";
import Library from "./Library";



export default function PostLibrary() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null); // NEW ✔v
  const [downloading, setDownLoading] = useState(null); // NEW ✔v
  const [notification, setNotification] = useState("");

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000); // hide after 3s
  };


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

  const handleDownload = async (post) => {
    setDownLoading(true)
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:8000/api/download-post/${post.id}`,
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
    link.download = "IPK Video.mp4";

    document.body.appendChild(link);
    link.click();
    link.remove();

    showNotification("Downloading Video...");
  } catch (err) {
    console.error(err);
    showNotification("Failed to download Video!");
  }
  finally{
    setDownLoading(false)
  }
};


  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

    if (!posts.length) {
    return (
      <div className="p-6 text-start border-b-2 border-blue-600 flex flex-col justify-center items-center  text-black text-3xl font-bold">
        Library is Empty.
      </div>
    );
  }
  const content = (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3  gap-4">
      {posts.map(post => (
        <div
          key={post.id}
          className="relative border rounded overflow-hidden hover:shadow-xl transition"
        >
         <Library post={post} handleDownload={handleDownload} handleRemove={handleRemove}
         deleteLoading={deleteLoading} downloading={downloading} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="lg:ml-64 ">
      <h1 className="text-black text-xl border-b-2 border-blue-600 pb-2 font-bold">Library</h1>
      {content}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg">
          {notification}
        </div>
      )}
    </div>
  )
}
