import { useEffect, useState } from "react";
import api from "../Api/axios";
import { Link } from "react-router-dom";


export default function AssignmentLibrary() {
  const [assignments, setAssignments] = useState([]);


  useEffect(() => {
  api.get("/api/student/library")
    .then(res => setAssignments(res.data));
}, []);

  

const content = (
     <div className="overflow-x-auto max-h-[70vh] no-scrollbar border rounded-lg shadow-md w-80 sm:w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <table className="min-w-full divide-y divide-white bg-white">
                <thead className="bg-blue-900 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase whitespace-nowrap tracking-wider">
                     Course Title
                    </th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium whitespace-nowrap uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-white text-sm font-medium uppercase tracking-wider">Resume Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                   {assignments.length === 0 && (
                      <p className="text-gray-500 text-center whitespace-nowrap p-4 mx-auto">No assignment available</p>
                    )}
                  {assignments.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3 font-medium text-black whitespace-nowrap">
                        {item.assignment.title}
                      </td>
                      <td className="px-4 py-3 text-black font-medium capitalize whitespace-nowrap">{new Date(item.assignment.due_at).toLocaleString()}</td>
                      <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                         <Link
                          to={`/student/assignment/${item.assignment.access_token}`}
                          className="btn-primary px-3 py-2 font-semibold text-sm bg-blue-600 text-white rounded"
                        >
                          Continue
                      </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
  );

  return (
    <div className="rounded-xl shadow lg:ml-60">

      <h2 className="font-bold bg-gray-900 text-white w-full p-3 rounded-lg text-center text-lg mb-4">
        Assignment Access ({assignments.length})
      </h2>

     

      {content}

    </div>
  );
}
