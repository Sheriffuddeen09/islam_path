import { X } from "lucide-react";

export default function PostImageOnly({closeModal, setShowVisibilityModal, handleSelectImages, video, imagePost
}){
return(
<div className="fixed inset-0 flex items-center justify-center bg-black/60">
<div className="bg-[var(--bg-color)] text-[var(--text-color)] border border-blue-500 sm:p-5 p-2 rounded-xl w-[95%] md:w-[600px]">
<div className="flex items-center justify-between mb-5">
<h2 className="sm:text-2xl text-xl font-bold">
Upload Image
</h2>
<button onClick={closeModal}>
<X />
</button>
</div>
 <div>
        <input
          type="file"
          id="imageupload" 
          accept="image/*" 
          className="hidden"
          multiple
          disabled={!!video}
          onChange={(e) => handleSelectImages(e.target.files)}
        />
         <label
            htmlFor="imageupload"
             className="flex flex-col items-center gap-1"
        >
            <img src={imagePost} alt="image-image" className="w-40 h-40 cursor-pointer hover:scale-105" />
            <label className="text-sm text-black font-bold">Image</label>
        </label>
</div>
</div>



</div>
)
}
