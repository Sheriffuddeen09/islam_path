import { useState } from "react";
import {
Image, Video, FileText, Film, Images, Clapperboard, X
} from "lucide-react";
import ReelVideoImageDescription from "./ReelVideoImageDescription";
import ReelDescriptionOnly from "./ReelDescriptionOnly";
import PostDescriptionOnly from "./PostDescriptionOnly";
import PostVideoOnly from "./PostVideoOnly";
import PostImageOnly from "./PostImageOnly";
import PostImageVideoDescription from "./PostImageVideoDescription";
export default function CreatePostModal({text, setText, visibility, setVisibility, submitPost, loading, showVisibilityModal,
    setShowVisibilityModal, handleSelectImages, video, imagePost
}) {
const [selected,setSelected] = useState(null);
const options = [
{
id:"reel-full", title:"Reel",
description:"Upload video, image and description.", icon:<Clapperboard size={25}/>
},{
id:"reel-description", title:"Reel Description", description:"Create reel using description only.", icon:<Film size={25}/>
},{
id:"post-description", title:"Post Description", description:"Create a text only post.", icon:<FileText size={25}/>
},{
id:"post-video", title:"Post Video", description:"Upload a video post only.", icon:<Video size={25}/>
},{
id:"post-image", title:"Post Image", description:"Upload an image post only.",
icon:<Image size={25}/>
},{
id:"post-all", title:"Post Full", description:"Upload image, video and description.", icon:<Images size={25}/>
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
if(selected === "post-description"){
return(
<PostDescriptionOnly
closeModal={() => {setSelected(null)}}
text={text} setText={setText}
showVisibilityModal={showVisibilityModal} 
setShowVisibilityModal={setShowVisibilityModal} submitPost={submitPost} loading={loading}
visibility={visibility} setVisibility={setVisibility}
/>
)
}
if(selected === "post-video"){
return(
<PostVideoOnly
closeModal={() => setSelected(null)}
text={text} setText={setText} showVisibilityModal={showVisibilityModal} 
setShowVisibilityModal={setShowVisibilityModal} submitPost={submitPost} loading={loading}
visibility={visibility} setVisibility={setVisibility}
/>
)
}
if(selected === "post-image"){
return(
<PostImageOnly
closeModal={() => setSelected(null)}
handleSelectImages={handleSelectImages} imagePost={imagePost} video={video}
text={text} setText={setText} showVisibilityModal={showVisibilityModal} 
setShowVisibilityModal={setShowVisibilityModal} submitPost={submitPost} loading={loading}
visibility={visibility} setVisibility={setVisibility}
/>
)
}
if(selected === "post-all"){
return(
<PostImageVideoDescription
closeModal={() => setSelected(null)}
text={text} setText={setText} showVisibilityModal={showVisibilityModal} 
setShowVisibilityModal={setShowVisibilityModal} submitPost={submitPost} loading={loading}
visibility={visibility} setVisibility={setVisibility}
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
p-2 sm:p-5 border border-green-500
">
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
md:grid-cols-3
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