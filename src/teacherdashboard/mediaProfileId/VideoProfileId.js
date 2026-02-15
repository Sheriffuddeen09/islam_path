function ProfilePosts({ id }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get(`/api/users/${id}/posts`).then(res => setPosts(res.data.posts));
  }, [id]);

  return posts.map(p => (
    <div key={p.id}>
      <p>{p.content}</p>
      {p.media.map(m =>
        m.type === "video" ? <video key={m.id} src={m.url} controls /> : <img key={m.id} src={m.url} />
      )}
    </div>
  ));
}
