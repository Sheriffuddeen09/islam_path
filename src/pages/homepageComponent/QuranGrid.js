import { quranList } from "./QuranData";

const QuranGrid = () => {

  const males = quranList.filter(q => q.gender === "male");
  const females = quranList.filter(q => q.gender === "female");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* MALE SECTION */}
      <h2 className="text-2xl font-bold mb-4 text-blue-800">
        Male Reciters
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">
        {males.map((quran) => (
          <div
            key={quran.id}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition cursor-pointer text-center"
          >
            <div className="w-16 h-16 mx-auto bg-blue-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              {quran.image}
            </div>

            <p className="mt-3 font-semibold">
              {quran.name}
            </p>
            {quran.link && (
        <a
          href={quran.link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs text-green-400 hover:underline"
        >
          Listen
        </a>
      )}
          </div>
        ))}
      </div>

      {/* FEMALE SECTION */}
      <h2 className="text-2xl font-bold mb-4 text-pink-700">
        Female Reciters
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {females.map((quran) => (
          <div
            key={quran.id}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition cursor-pointer text-center"
          >
            <div className="w-16 h-16 mx-auto bg-pink-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              {quran.image}
            </div>

            <p className="mt-3 font-semibold">
              {quran.name}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default QuranGrid;
