
import React, { useState, useEffect } from "react";
import useAuthCheck from "../layout/UserAuthCheck";

export default function StudentRequest() {
  const [isloading, setIsLoading] = useState(true);
  

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

 const { isLoggedin, user, loading } = useAuthCheck();

  return (
    <div className="">

      <section className="flex-1 lg:ml-64 p-6 transition-all">

        <div className="flex justify-end mb-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold">Assalamu Alaykum <b>{isLoggedin ? `${user.first_name}` : "No user"}</b></span>
            <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isloading ? (
            <>
              {[1,2,3,4].map((i)=>(
                <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-xl"></div>
              ))}
            </>
          ) : (
            <>
              <Card title="Video Post" value="152" color="bg-blue-100" />
              <Card title="Notification" value="$2,100" color="bg-orange-100" />
              <Card title="Reviews" value="28,441" color="bg-green-100" />
              <Card title="Rate" value="152 Unread" color="bg-purple-100" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Sales */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-xl p-4">
            {isloading ? (
              <SkeletonTable />
            ) : (
              <>
                <h2 className="font-bold text-lg mb-4">Request</h2>
                <table className="w-full text-left">
                  <thead className="text-gray-400 text-sm">
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Bamboo Watch", price: "$65", img: "🟤" },
                      { name: "Black Watch", price: "$72", img: "⚫" },
                      { name: "Blue Band", price: "$79", img: "🔵" },
                    ].map((item, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-2">{item.img}</td>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.price}</td>
                        <td className="p-2 text-blue-500 cursor-pointer">🔍</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {/* Sales Overview */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            {isloading ? (
              <div className="animate-pulse bg-gray-200 h-64 rounded-xl"></div>
            ) : (
              <>
                <h2 className="font-bold text-lg mb-4">Sales Overview</h2>
                <div className="h-64 w-full bg-gray-100 rounded-lg flex items-center justify-center">
                  📈 Chart Placeholder
                </div>
              </>
            )}
          </div>

        </div>

      </section>
    </div>
  );
}

/* ---------------------- CARD ---------------------- */
function Card({ title, value, color }) {
  return (
    <div className="p-5 rounded-xl shadow bg-white hover:scale-[1.02] transition cursor-pointer">
      <div className={`${color} w-10 h-10 rounded-lg mb-2`}></div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

/* ---------------------- SKELETON TABLE ---------------------- */
function SkeletonTable() {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 w-1/3 rounded mb-4"></div>
      {[1,2,3].map((i)=>(
        <div key={i} className="flex gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
