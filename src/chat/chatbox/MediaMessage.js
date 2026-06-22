import Linkify from "linkify-react";
import MediaGrid from "./MediaGrid";
import { useState } from "react";

export default function MediaMessage({
  msg,
  setPreview, uiMode
}) {

  const [expandedMessages, setExpandedMessages] = useState({});
    
      const isExpanded =
      expandedMessages[msg.id];
    
    const messageText =
      msg.message || "";
    
    const shouldTrim =
      messageText.length > 250;
    
    const displayText =
      shouldTrim && !isExpanded
        ? messageText.slice(0, 250) + "..."
        : messageText;
    


  if (
    !["image", "video"].includes(
      msg.type
    )
  )
    return null;


    const cleanMessage =
  typeof msg.message === "string"
    ? msg.message.trim()
    : "";

  return (
    <div className="w-full">

      <MediaGrid
        msg={msg}
        setPreview={setPreview}
        uiMode={uiMode}
      />

      {/* caption */}
       {cleanMessage !== "" && (
      
        <div
            className={`
          text-[13px] lg:text-[13px] md:text-[16px]
          mt-1
          text-white
          w-fit
          break-words
          ${uiMode === 'full' ? 'max-w-64' : 'max-w-56 lg:max-w-56 md:max-w-96 '}
        `}>
            <Linkify
              options={{
                target: "_blank",
                className:
                  "text-blue-400 pointer-events-auto",
              }}
            >
       {displayText}
       </Linkify> 
           {shouldTrim && (
          <button
            onClick={() =>
              setExpandedMessages((prev) => ({
                 ...prev,
                 [msg.id]:
                   !prev[msg.id],
               }))
             }
             className="
               ml-2
               text-green-400
               text-xs
               font-semibold
               hover:underline
             "
           >
             {isExpanded
               ? "See less"
               : "See more"}
           </button>
         )} 
           </div>
           )}
        
          
       
    </div>
  );
}


