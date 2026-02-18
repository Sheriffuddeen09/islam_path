import { Link } from "react-router-dom";
import { quranList } from "./QuranData";

const QuranGrid = () => {

  const males = quranList.filter(q => q.gender === "male");
  const females = quranList.filter(q => q.gender === "female");

  return (
    <div className="max-w-7xl mx-auto px-4 pb-12 pt-24">

      {/* MALE SECTION */}
   
      <div className="flex items-center justify-between gap-3 p-2 text-2xl font-bold mb-4 border-b-2 border-blue-600 pb-2 text-black">
              <Link className="text-blue-700 text-sm sm:text-2xl" to={'https://qurancentral.com/audio/search'}>
              Search More Quran Recitation</Link>
              <h4 className="text-xs font-bold text-black sm:text-2xl">
                Male 
              </h4>
              </div>

      <div className="grid grid-cols-1 mx-auto justify-items-center md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
        {males.map((quran) => (
          <div
            key={quran.id}
            className="bg-white text-black p-6 sm:w-full w-72 rounded-2xl shadow hover:shadow-lg transition cursor-pointer text-center"
          >
            <div className="w-16 h-16 mx-auto bg-blue-600 text-white flex items-center justify-center rounded-full text-2xl font-bold">
              {quran.image}
            </div>

            <p className="mt-3 mb-2 font-semibold">
              {quran.name}
            </p>
            {quran.link && (
        <a
          href={quran.link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm text-white rounded hover:bg-gray-700 bg-gray-800 p-2"
        >
          Listen / Download
        </a>
      )}
          </div>
        ))}
      </div>

      {/* FEMALE SECTION */}
      <h2 className="text-2xl font-bold border-b-2 border-pink-600 pb-2 mb-4 text-black">
        Female Reciters
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {females.map((quran) => (
          <div
            key={quran.id}
            className="bg-white text-black p-4 rounded-2xl shadow hover:shadow-lg transition cursor-pointer text-center"
          >
            <div className="w-16 h-16 mx-auto bg-pink-600 text-white flex items-center justify-center rounded-full text-2xl font-bold">
              {quran.image}
            </div>

            <p className="mt-3 mb-2 font-semibold text-black">
              {quran.name}
            </p>
            {quran.link && (
              <a
                href={quran.link}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-white rounded hover:bg-gray-700 bg-gray-800 p-2"
              >
                Listen / Download
              </a>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default QuranGrid;
