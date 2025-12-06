// src/components/VideoView.jsx
import { useEffect, useState } from "react";
import api from "../../Api/axios";
import CommentItem from "./CommentItem";

const EMOJIS = ['❤️','👍','😂','😮','😢','🔥'];

export default function VideoView({ videoId, user }) {
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/videos/${videoId}`);
        setVideo(res.data.video);
        // flatten top-level comments
        setComments(res.data.video.comments || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  },[videoId]);

  const addComment = async (parentId=null) => {
    if(!body.trim()) return;
    const payload = { body, parent_id: parentId };
    const res = await api.post(`/videos/${videoId}/comments`, payload);
    // optimistic: add to list
    setComments(prev => parentId ? prev.map(c => c.id === parentId ? { ...c, replies: [...(c.replies||[]), res.data.comment] } : c) : [res.data.comment, ...prev]);
    setBody('');
  };

  const toggleReaction = async (type, id, emoji) => {
    await api.post('/reactions/toggle', { type, id, emoji });
    // reload summary or patch local state; for brevity: reload video
    const res = await api.get(`/videos/${videoId}`);
    setVideo(res.data.video);
  };

  if(loading) return <div>Loading...</div>;
  if(!video) return <div>Video not found</div>;

  return (
    <div className="flex-1 p-6">
      <div className="bg-black rounded">
        <video controls src={video.video_url} poster={video.thumbnail_url} className="w-full h-96 object-cover" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          <h2 className="text-xl font-bold">{video.title}</h2>
          <p className="text-sm text-gray-600">By {video.user.first_name} {video.user.last_name}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* emoji reaction summary */}
          {video.reaction_summary?.map(r => (
            <button key={r.emoji} onClick={()=>toggleReaction('video', video.id, r.emoji)} className="px-2 py-1 rounded bg-gray-100">{r.emoji} {r.count}</button>
          ))}
          {/* show emoji picker */}
          {EMOJIS.map(e => <button key={e} onClick={()=>toggleReaction('video', video.id, e)} className="px-2">{e}</button>)}
          <a href={`/videos/${video.id}/download`} className="ml-2 px-3 py-1 border rounded">Download</a>
          <button onClick={()=>api.post(`/videos/${video.id}/save`).then(()=>alert('saved'))} className="px-3 py-1 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Comments</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <img src={user?.avatar || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <textarea value={body} onChange={e=>setBody(e.target.value)} className="w-full p-2 border" placeholder="Write a comment..." />
              <div className="text-right mt-2">
                <button onClick={()=>addComment(null)} className="px-3 py-1 bg-green-600 text-white rounded">Comment</button>
              </div>
            </div>
          </div>

          {comments.map(c => (
            <CommentItem key={c.id} comment={c} onReplyAdded={(reply)=> {
              setComments(prev => prev.map(pc => pc.id === c.id ? ({...pc, replies: [...(pc.replies||[]), reply]}) : pc));
            }} onReactionChanged={()=>{/* refresh list or patch */}} />
          ))}

        </div>
      </div>
    </div>
  );
}
