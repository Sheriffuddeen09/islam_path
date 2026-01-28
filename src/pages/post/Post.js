<div
  className={`p-4 rounded-lg ${
    post.content && !post.image && !post.video
      ? "bg-black text-white"
      : "bg-white"
  }`}
>
  {post.content && <p className="mb-2">{post.content}</p>}

  {post.image && (
    <img
      src={post.image}
      className="rounded-lg max-h-[500px]"
    />
  )}

  {post.video && (
    <video
      src={post.video}
      controls
      className="rounded-lg max-h-[500px]"
    />
  )}
</div>
