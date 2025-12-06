import { useState, useEffect } from "react";
import api from "../Api/axios";

export default function AdminVideoForm({ onCreated }) {
  const [title,setTitle]=useState('');
  const [desc,setDesc]=useState('');
  const [category,setCategory]=useState('');
  const [categories,setCategories]=useState([]);
  const [videoFile,setVideoFile]=useState(null);
  const [thumb,setThumb]=useState(null);
  const [loading,setLoading]=useState(false);

  useEffect(()=>{ // optional: fetch categories
    (async()=>{ try { const res = await api.get('/api/categories'); setCategories(res.data); }catch(e){}})();
  },[]);

  const submit = async (e) => {
    e.preventDefault();
    if(!videoFile) return alert("Video required");
    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', desc);
    fd.append('category_id', category);
    fd.append('video', videoFile);
    if(thumb) fd.append('thumbnail', thumb);
    try {
      setLoading(true);
      const res = await api.post('/videos', fd, { headers: {'Content-Type':'multipart/form-data'} });
      onCreated && onCreated(res.data.video);
      setTitle(''); setDesc(''); setVideoFile(null); setThumb(null);
    } catch(err){ console.error(err); alert('upload failed') }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-white rounded shadow">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border"/>
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" className="w-full p-2 border" />
      <select value={category} onChange={e=>setCategory(e.target.value)} className="p-2 border w-full">
        <option value="">Select category</option>
        {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input type="file" accept="video/*" onChange={e=>setVideoFile(e.target.files[0])} />
      <input type="file" accept="image/*" onChange={e=>setThumb(e.target.files[0])} />
      <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Uploading...' : 'Upload Video'}</button>
    </form>
  );
}
