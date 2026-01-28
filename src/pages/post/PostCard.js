import PostOptions from "./PostOption";

export default function PostCard({ post }) {
  const isTextOnly = post.content && !post.image && !post.video;

  const getWordCount = (text = "") => {
  return text
    .replace(/\n/g, " ")        // remove line breaks
    .replace(/[^\w\s]/g, "")   // remove punctuation
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
};

  const getTextSizeClass = (text = "") => {
  const words = getWordCount(text);

  if (words <= 14) return "text-3xl px-6 py-16";
  if (words <= 20) return "text-2xl px-6 py-14";
  return "text-sm px-4 py-6";
};



  return (
    <div
      className={`p-4 rounded-lg sm:w-96 border`}
    >
      {/* USER */}
      <div className="flex items-start justify-between">
      <div className="flex items-center gap-3 mb-3">
        <p className="font-bold text-white pb-1 bg-black text-[40px] rounded-full w-12 h-12 text-center
        flex flex-col items-center justify-center">
          {post.user.name?.[0]}
        </p>
        <div>
          <p className="font-semibold">{post.user.name}</p>
          <p className="text-xs opacity-70">{post.created_at}</p>
        </div>
      </div>

      <PostOptions post={post} />
      </div>

      {/* TEXT */}
      <div
      className={`${
        isTextOnly
          ? `bg-black text-white h-64 my-6 rounded mx-auto flex flex-col
          justify-center items-center text-center font-semibold ${getTextSizeClass(post.content)}`
          : "bg-white"
      }`}
    >
      {post.content && (
        <p className="whitespace-pre-line">
          {post.content}
        </p>
      )}
    </div>



      {/* IMAGE */}
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="rounded-lg max-h-[500px] w-full object-cover mb-3"
        />
      )}

      {/* VIDEO */}
      {post.video && (
        <video
          src={post.video}
          controls
          className="rounded-lg max-h-[500px] w-full mb-3"
        />
      )}

      {/* FOOTER */}
      <div className="flex justify-between text-sm opacity-70 mt-3">
        <span>❤️ {post.reactions_count}</span>
        <span>💬 {post.comments_count}</span>
        <span>👁 {post.views}</span>
      </div>
    </div>
  );
}
