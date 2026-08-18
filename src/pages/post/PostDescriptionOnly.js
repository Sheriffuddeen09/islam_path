import { X } from "lucide-react";
export default function PostDescriptionOnly({closeModal, text, setText, setShowVisibilityModal}){
return(
<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
<div
className=" bg-[var(--bg-color)] text-[var(--text-color)] sm:p-5 p-2 border border-green-500
w-[95%]
md:w-[600px]
rounded-xl
">
<div
className=" flex
justify-between
items-center
mb-5
">
<h2 className="text-xl font-bold">
Description Post
</h2>
<button
onClick={closeModal}
>
<X/>
</button>
</div>
<textarea
value={text}
onChange={e => setText(e.target.value)}
placeholder="Write something" 
className=" w-full
h-40 text-black
border scrollbar scrollbar-thumb-gray-200 scrollbar-track-transparent scrollbar-thin
rounded-xl
p-4
outline-none
resize-none
"/>
<button
onClick={() => {setShowVisibilityModal(true); closeModal()}}
className=" w-full
mt-5
p-3
rounded-xl
bg-blue-600
text-white
">
Create Post
</button>
</div>

</div>
)
}