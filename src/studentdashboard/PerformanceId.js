import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import api from "../Api/axios";

const COLORS = ["#16a34a", "#dc2626"];

export default function PerformanceId() {
  const [students, setStudents] = useState([]);
  const [accuracy, setAccuracy] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);

  /* FILTER STATE */
  const [selectedClass, setSelectedClass] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [
          studentsRes,
          accuracyRes,
          performanceRes,
        ] = await Promise.all([
          api.get("/api/analytics/students"),
          api.get("/api/analytics/accuracy"),
          api.get("/api/analytics/performance"),
        ]);

        setStudents(studentsRes.data);
        setAccuracy(accuracyRes.data);
      
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  /* ===== FILTER LOGIC ===== */
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedClass !== "all" && s.class !== selectedClass) return false;

      if (startDate && new Date(s.created_at) < new Date(startDate)) return false;
      if (endDate && new Date(s.created_at) > new Date(endDate)) return false;

      return true;
    });
  }, [students, selectedClass, startDate, endDate]);

  if (loading) return (
      <div className="text-black flex items-center justify-center h-10">
        <div className="text-black animate-spin rounded-full h-6 w-6 my-10 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );

  /* ===== CHART DATA ===== */
  const performanceChart = [
  { name: "Assignments", score: performance?.assignments ?? 0 },
  { name: "Exams", score: performance?.exams ?? 0 },
];


  const accuracyChart = [
  { name: "Assignment Accuracy", value: accuracy?.assignment_accuracy ?? 0 },
  { name: "Exam Accuracy", value: accuracy?.exam_accuracy ?? 0 },
];

if (!performance || !accuracy) return null;


  return (
    <div className="text-black sm:p-6 py-3 sm:space-y-8">

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-gray-500 text-sm">Assignment Accuracy</p>
        <p className="text-2xl font-bold">
          {accuracy.assignment_accuracy?.toFixed(1)}%
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-gray-500 text-sm">Exam Accuracy</p>
        <p className="text-2xl font-bold">
          {accuracy.exam_accuracy?.toFixed(1)}%
        </p>
      </div>

      <div className="bg-white p-4 rounded shadow text-center">
        <p className="text-gray-500 text-sm">Overall Performance</p>
        <p className="text-2xl font-bold">
          {(
            (performance.assignments + performance.exams) / 2
          ).toFixed(1)}%
        </p>
      </div>
    </div>


      {/* ===== CHARTS ===== */}
      <div className="text-black grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BAR CHART */}
        <div className="text-black bg-white p-4 rounded shadow">
          <h3 className="text-black font-semibold mb-3">Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={performanceChart}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE CHART */}
        <div className="text-black bg-white p-4 rounded shadow">
          <h3 className="text-black font-semibold mb-3">Answer Accuracy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={accuracyChart}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                label
              >
                {accuracyChart.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== STUDENT TABLE =====  */}

      <div>
        <h2 className="text-black font-semibold mb-3">Student Performance</h2>
    
       <div className="overflow-x-auto max-h-[70vh] border rounded-lg shadow-md w-80 no-scrollbar sm:w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-white bg-white">
                 {filteredStudents.length === 0 && (
        <p className="text-gray-500 p-4 text-center whitespace-nowrap">No Student Performance Available</p>
      )}
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium whitespace-nowrap uppercase tracking-wider">Average</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase whitespace-nowrap tracking-wider">Assignment</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Exam</th>
                <th className="px-4 py-3 text-left text-gray-600 font-medium uppercase tracking-wider">Badges</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{s.name}</td>
                  <td>{(((s.assignment_avg ?? 0) + (s.exam_avg ?? 0)) / 2).toFixed(1)}%</td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{s.assignment_avg || "--"}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{s.exam_avg || "--"}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{s.total_badges || "--"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      
    </div>
  );
}

/* ===== SMALL CARD ===== */
function StatCard({ title, value }) {
  return (
    <div className="text-black bg-white rounded shadow p-4 text-center">
      <p className="text-black text-sm text-gray-500">{title}</p>
      <p className="text-black text-2xl font-bold">{value}</p>
    </div>
  );
}
