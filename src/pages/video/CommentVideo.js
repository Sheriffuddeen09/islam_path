// src/components/CommentItem.jsx
import { useState } from "react";
import api from "../../Api/axios";
const EMOJIS = ['❤️','👍','😂','😮','😢','🔥'];

export default function CommentItem({ comment, onReplyAdded }) {
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  const postReply = async () => {
    if(!replyText.trim()) return;
    const res = await api.post(`/videos/${comment.video_id}/comments`, { body: replyText, parent_id: comment.id });
    onReplyAdded && onReplyAdded(res.data.comment);
    setReplyText(''); setShowReply(false);
  };

  const toggleReaction = async (emoji) => {
    await api.post('/reactions/toggle', { type:'comment', id: comment.id, emoji });
    // ideally update local reactions list
  };

  return (
    <div className="flex gap-3">
      <img src={comment.user.avatar || '/default-avatar.png'} className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{comment.user.first_name}</div>
              <div className="text-sm text-gray-700">{comment.body}</div>
            </div>
            <div className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {EMOJIS.map(e => <button key={e} onClick={()=>toggleReaction(e)} className="text-sm">{e}</button>)}
            <button onClick={()=>setShowReply(s=>!s)} className="text-sm text-blue-600">Reply</button>
          </div>
        </div>

        {/* replies */}
        <div className="pl-6 mt-2 space-y-2">
          {(comment.replies || []).map(r => (
            <div key={r.id} className="bg-white p-2 rounded border">
              <div className="text-sm"><strong>{r.user.first_name}</strong> {r.body}</div>
            </div>
          ))}
        </div>

        {showReply && (
          <div className="mt-2 flex gap-2">
            <input value={replyText} onChange={e=>setReplyText(e.target.value)} className="flex-1 p-2 border" />
            <button onClick={postReply} className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
