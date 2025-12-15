import { useEffect, useState } from "react";
import VideoPage from "./VideoPage";  
import api from "../../Api/axios";

export default function VideoList() {
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const videosRes = await api.get("/api/videos");
        const categoriesRes = await api.get("/api/categories");
        const adminRes = await api.get("/api/admin");

        setVideos(videosRes.data.data);
        setCategories(categoriesRes.data);
        setAdmin(adminRes.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  // 🚀 Rolling Loader UI
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  return (
    <div className="">
      <VideoPage
        videos={videos}
        admin={admin}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}
