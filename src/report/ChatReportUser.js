import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import api from "../Api/axios";

const ChatReportUser = () => {
  const { chatId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get(`/chat/report/${chatId}`);
        setReport(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [chatId]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!report)
    return <div className="p-6 text-center text-red-500">Report not found</div>;

  return (
    <div className="container mx-auto max-w-2xl mt-6 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Chat Report</h2>

      <div className="flex items-center mb-4">
        <FaUser className="w-8 h-8 text-blue-500 mr-2" />
        <div>
          <p className="font-medium">
            Reporter: {report.reporter.name} ({report.reporter.email})
          </p>
          <p className="text-sm text-gray-500">
            Reported At: {new Date(report.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Reason:</p>
        <p className="text-gray-700">{report.reason}</p>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Details:</p>
        <p className="text-gray-700">{report.details || "No details provided"}</p>
      </div>

      <div className="mb-4">
        <p className="font-semibold">Chat ID:</p>
        <p className="text-gray-700">{report.chat_id}</p>
      </div>
    </div>
  );
};

export default ChatReportUser;