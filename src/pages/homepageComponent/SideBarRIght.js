import { useState } from "react";
import { quranList } from "./QuranData";
import { Link } from "react-router-dom";

export default function SideBarRIght() {

  const [showMoreMale, setShowMoreMale] = useState(false);
  const [showMoreFemale, setShowMoreFemale] = useState(false);

  const males = quranList.filter(item => item.gender === "male");
  const females = quranList.filter(item => item.gender === "female");

  const visibleMales = showMoreMale ? males : males.slice(0, 10);
  const visibleFemales = showMoreFemale ? females : females.slice(0, 10);

  return (
    <aside className="fixed hidden sm:block top-[75px] right-2 
        h-[85vh] w-80 bg-white shadow-md p-4 z-40
      overflow-y-auto overflow-x-hidden
      scrollbar-thin scrollbar-thumb-gray-400">
        {/* <p className="text-2xl text-center font-bold border-b-2 pb-2 text mb-2">Quran Recitation</p> */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-gray-500 mb-1 mt- uppercase">
          Male Quran Recitation
        </h4>
        <ul className="space-y-2">
          {visibleMales.map(item => (
            <li key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg 
                hover:bg-gray-100 transition cursor-pointer">
              <Link to={item.link}>
              <div className="w-8 h-8 flex items-center justify-center
                  rounded-full bg-blue-500 text-white text-lg font-semibold">
                {item.image}
              </div>
            <div className="flex flex-col ">
                <span className="text-sm text-gray-700">
                {item.name}
                </span>
              {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-green-400 hover:underline"
              >
                Listen / Download
              </a>
            )}
            </div>
            </Link>
            </li>
          ))}
        </ul>
        {males.length > 10 && (
          <button
            onClick={() => setShowMoreMale(!showMoreMale)}
            className="text-xs text-blue-600 mt-2 hover:underline"
          >
            {showMoreMale ? "See Less" : "See More"}
          </button>
        )}
      </div>

      {/* FEMALE SECTION */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 mb-1 uppercase">
          Female Quran Recitation
        </h4>

        <ul className="space-y-2">
          {visibleFemales.map(item => (
            <li key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg 
                hover:bg-gray-100 transition cursor-pointer">

             <Link to={item.link}>
              <div className="w-8 h-8 flex items-center justify-center
                  rounded-full bg-blue-500 text-white text-lg font-semibold">
                {item.image}
              </div>
            <div className="flex flex-col ">
                <span className="text-sm text-gray-700">
                {item.name}
                </span>
              {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs text-green-400 hover:underline"
              >
                Listen / Download
              </a>
            )}
            </div>
            </Link>
            </li>          ))}
        </ul>

        {females.length > 10 && (
          <button
            onClick={() => setShowMoreFemale(!showMoreFemale)}
            className="text-xs text-blue-600 mt-2 hover:underline"
          >
            {showMoreFemale ? "See Less" : "See More"}
          </button>
        )}
      </div>

    </aside>
  );
}
