import PostFeed from "./post/PostFeed";


export default function HomePage({posts, setPosts}) {


  return (
    <div>
      <PostFeed posts={posts} setPosts={setPosts} />
    </div>
  )
}