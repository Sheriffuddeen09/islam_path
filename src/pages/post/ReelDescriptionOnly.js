import { useState } from "react";
import { X } from "lucide-react";
export default function ReelDescriptionOnly({ closeModal }) {
const [description, setDescription] = useState("");
return (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
<div className="bg-[var(--bg-color)] text-[var(--text-color)]  sm:p-5 p-2  rounded-xl w-full max-w-xl">
<div className="flex items-center justify-between mb-5">
<h2 className="sm:text-2xl text-xl font-bold">
Description Reel
</h2>
<button onClick={closeModal}>
<X />
</button>
</div>
<div>
<textarea
rows={8}
value={description}
onChange={(e) => setDescription(e.target.value)}
placeholder="Write your reel description here..." className="w-full border rounded-lg p-4 resize-none outline-none" />
</div>
<button
className="w-full bg-blue-600 font-smeibold text-white p-3 rounded-lg mt-5" >
Create Reel Description 
</button>
</div>
</div>
);
}
