import { useEffect, useState } from "react";
import api from "../Api/axios";
import VideoCard from "./VideoCard";

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

   

  useEffect(() => {
    async function fetchData() {
      try {
        const videosRes = await api.get("/api/videos");

        setVideos(videosRes.data.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  const handleDeleteVideo = (id) => {
  setVideos((prev) => prev.filter((v) => v.id !== id));
};

  if (loading)
    return (
      <div className="flex items-center justify-center mt-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

    if (!videos.length) {
    return (
      <div className="text-center text-gray-500 text-xl font-medium py-16">
        No Video found.
      </div>
    );
  }
  return (
    <div className="">
      <ul className="grid 
       grid-cols-1 
       md:grid-cols-2 
       lg:grid-cols-3  
       justify-items-center items-center
       gap-3  w-full">
                     {videos.map((v) => (
                 
                       <li key={v.id} className="border rounded-xl mb-3 shadow-sm">
                     <div>
                        <VideoCard key={v.id}
                        video={v}
                        onDelete={handleDeleteVideo}
                      />
                     </div>
                   </li>
     
                     ))}
                   </ul>
    </div>
  );
}
