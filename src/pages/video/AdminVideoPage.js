import { useEffect, useState } from "react";
import VideoPage from "./VideoPage";  // your sidebar component
import api from "../../Api/axios";

export default function AdminVideoPage({videos, setVideos}) {
  const [categories, setCategories] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");


  useEffect(() => {
  async function fetchData() {
    try {
      const videosRes = await api.get("/api/videos");
      const categoriesRes = await api.get("/api/categories");
      const adminRes = await api.get("/api/admin");

      setVideos(videosRes.data.data);   // Laravel pagination returns { data: [] }
      setCategories(categoriesRes.data); // array
      setAdmin(adminRes.data);           // admin object
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  fetchData();
}, []);


  if (loading) return <p>Loading...</p>;

  
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
