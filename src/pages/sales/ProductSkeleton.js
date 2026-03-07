export default function ProductSkeleton() {
  return (
    <div className="animate-pulse grid md:grid-cols-3 gap-8 p-6">

      <div className="md:col-span-2">
        <div className="bg-gray-300 h-[400px] rounded"></div>

        <div className="flex gap-2 mt-4">
          {[1,2,3,4].map((i)=>(
            <div key={i} className="w-20 h-20 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-300 h-8 w-3/4"></div>
        <div className="bg-gray-300 h-6 w-1/2"></div>
        <div className="bg-gray-300 h-10"></div>
      </div>

    </div>
  );
}