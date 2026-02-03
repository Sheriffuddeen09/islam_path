import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import PostComment from "./PostComment";
import ReplyImageSlider from "./ReplyImageSlider";

export default function PostImagePageId() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  if (!post) return <div className="text-black lg:ml-96 mx-auto sm:text-xl flex flex-col justify-center items-center text-center text-sm font-bold ">
                      Post not found</div>;

  return (
    <div className="flex h-screen">
      {/* Left: Image slider */}
      <div className="flex-1 bg-black flex items-center justify-center">
        <ReplyImageSlider images={post.images} />
      </div>

      {/* Right: Fixed comments */}
      <div className="w-[400px] border-l overflow-y-auto">
        <PostComment postId={post.id} />
      </div>
    </div>
  );
}
