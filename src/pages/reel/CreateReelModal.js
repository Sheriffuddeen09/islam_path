import {Film, Clapperboard, X} from "lucide-react";
import ReelVideoImageDescription from "./ReelVideoImageDescription";
import ReelDescriptionOnly from "./ReelDescriptionOnly";
export default function CreateReelModal({text, setText, visibility, setVisibility, submitPost, loading, showVisibilityModal,
    setShowVisibilityModal, selected,setSelected, setCreateReel
}) {
const options = [
{
id:"reel-description", title:"Reel Description", description:"Create reel using description only.", icon:<Film size={25}/>
}, 
{
id:"reel-full", title:"Reel",
description:"Upload video, image and description.", icon:<Clapperboard size={25}/>
}
];
//show selected component
if(selected === "reel-full"){
return(
<ReelVideoImageDescription
closeModal={() => setSelected(null)}
text={text} setText={setText} showVisibilityModal={showVisibilityModal} 
setShowVisibilityModal={setShowVisibilityModal} submitPost={submitPost} loading={loading}
visibility={visibility} setVisibility={setVisibility}
/>
)
}
if(selected === "reel-description"){
return(
<ReelDescriptionOnly
closeModal={() => setSelected(null)}
/>
)
}

return (
<div>
<div
className=" bg-[var(--bg-color)] text-[var(--text-color)]
w-[95%]
md:w-[700px]
rounded-xl
shadow-xl
p-2 sm:p-5 border border-white relative
">
    <button 
    className="absolute right-4 top-4"
    onClick={() => setCreateReel(false)}>
        <X />
    </button>
<div
className=" flex
justify-between
items-center
mb-5
">
<h2
className=" font-bold
text-2xl ">
Create Post
</h2>
</div>
<div
className=" grid
md:grid-cols-2 grid-cols-1
gap-2 sm:gap-5
">
{options.map((item)=>(
<button
key={item.id}
onClick={()=>setSelected(item.id)}
className=" border
rounded-xl
p-5
text-left
shadow-sm
hover:shadow-lg
transition
duration-300
hover:-translate-y-1
">
<div
className=" w-14
h-14
rounded-full
bg-blue-100
text-blue-600
flex
items-center
justify-center
mb-3
">
{item.icon}
</div>
<h2
className=" font-bold
text-lg
">
{item.title}
</h2>
<p
className=" text-sm 
mt-2
">
{item.description}
</p>
</button>
))}
</div>
</div>
</div>
);
}