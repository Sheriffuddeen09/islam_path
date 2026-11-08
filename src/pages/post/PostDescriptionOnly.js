import { Send, X } from "lucide-react";
export default function PostDescriptionOnly({closeModal, text, setText, submitPost, loading}){
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
        onClick={submitPost}
        disabled={loading}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg"
      >
       
       {loading ? <svg
              className="animate-spin h-5 w-5 text-white mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className=""
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className=""
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg> : <p className='inline-flex gap-2 items-center'> 
                        <Send /> Send Post
                        </p>}


      </button>
</div>

</div>
)
}