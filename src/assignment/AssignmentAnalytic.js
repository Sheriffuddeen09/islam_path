import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
  import { Bar } from "react-chartjs-2";


export default function AssignmentAnalytics({ data }) {


const data = {
  labels: analytics.scores.map((_, i) => `Student ${i+1}`),
  datasets: [{
    label: "Scores",
    data: analytics.scores
  }]
};

<Bar data={data} />

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-6">
      <h3 className="font-semibold mb-4">Score Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.score_distribution}>
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

{/* <AssignmentAnalytics data={analytics} />

<div className="grid grid-cols-2 gap-4 mt-4">
  <div className="card">Submitted: {analytics.submitted}</div>
  <div className="card">Late: {analytics.late}</div>
  <div className="card">Avg Score: {analytics.average_score}%</div>
</div> */}