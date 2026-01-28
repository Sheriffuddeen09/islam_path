import { useEffect, useState } from "react";
import PostCard from "./PostCard";
import api from "../../Api/axios";

export default function PostFeed({posts, setPosts}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/posts-get");
        setPosts(res.data.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  return (
    <div className="space-y-6">
        <div className="flex flex-col lg:flex-row min-h-screen bg-white text-gray-800">
        {/* Mobile Menu Button */}

        {/* Sidebar */}
        <aside
          className={`fixed hidden lg:block top-[80px] left-2 rounded-xl h-full w-80 mx-auto text-center md:py-10 lg:py-8  bg-white border border-t border-2 py-4 sm:px-3 px-4 z-40
            transform transition-transform duration-300
            overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100`}
        >

          <h3 className="text-xs text-blue-800 font-bold mb-2">FILTER VIDEO</h3>
          <ul className="space-y-4 mb-">
            <li>
              All
            </li>
          </ul>
        </aside>
    
    
      {
        posts.length === 0 && (
          <p className="text-black mx-auto sm:text-xl flex flex-col justify-center items-center text-center text-sm font-bold ">
            No Feed Post Available
          </p>
         )
      }
    <div className="flex-1 transition-all p-4 mt-20 gap-3 lg:ml-64 flex flex-col items-center">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      </div>
      
    </div>
    </div>
  );
}
