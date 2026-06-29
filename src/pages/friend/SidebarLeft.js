import { useState } from "react";
import { linkList } from "../homepageComponent/LinkData";

export default function SidebarLeft() {

  const [showMoreMale, setShowMoreMale] = useState(false);

  const links = linkList.filter(item => item.link === "link");

  const visibleMales = showMoreMale ? links : links.slice(0, 10);

  return (
    
    <aside className="fixed hidden lg:block top-[80px] left-
      h-full w-72 bg-[var(--bg-color)] shadow-md p-4 z-40 rounded-lg flex-1
      overflow-y-auto overflow-x-hidden text-[var(--text-color)]
      scrollbar-thin scrollbar-thumb-gray-400">
        <p className="text-2xl text-center font-bold border-b-2 pb-2 mb-2">Knowledge Practice</p>
      <div className="mb-6">
        <ul className="space-y-">
          {visibleMales.map(item => (
            <li key={item.id}
                className="flex items-center gap-3 p-2 lg 
                hover:bg-gray-100 transition cursor-pointer">

              <div className={`w-8 h-8 flex items-center justify-center
                  rounded-full ${item.background} text-white text-lg font-semibold`}>
                    
                {item.image}
              </div>
            <div className="flex flex-col ">
                <span className="text-sm">
                {item.name}
                </span>
               <span className="text-xs">
                {item.gender}
              </span>
            </div>
            </li>
          ))}
        </ul>
        {links.length > 10 && (
          <button
            onClick={() => setShowMoreMale(!showMoreMale)}
            className="text-xs text-blue-600 mt-2 hover:underline"
          >
            {showMoreMale ? "See Less" : "See More"}
          </button>
        )}
      </div>
    </aside>
  );
}
