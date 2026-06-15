import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import api from "../Api/axios";

const CommunityReportId = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get(
            `/api/community/report/view/${id}`
          );

          setReport(data.report);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  if (!report)
    return <div className="p-6 text-center text-red-500">Report is not found</div>;

  return (
  <div className="min-h-screen bg-gray-50 py-16 px-4">
    <div className="max-w-3xl mt-10 mx-auto">

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaUser className="text-white" />
            Community Channel Report
          </h2>
          <p className="text-red-100 text-sm mt-1">
            Report details and post information
          </p>
        </div>

        <div className="p-6 space-y-8">

          {/* Reporter Section */}
          <div className="flex items-center justify-between flex-wrap gap-4">

            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
                {report.reporter?.first_name?.charAt(0).toUpperCase()}
              </div>

              <p className="text-lg font-semibold text-gray-800">
                {report.reporter?.first_name} {report.reporter?.last_name}
              </p>

              <p className="text-sm text-gray-500">
                {report.reporter?.email}
              </p>
            </div>

            <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              {new Date(report.created_at).toLocaleString()}
            </div>
          </div>

          <hr />

          {/* Reason */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Reason</p>
            <span className="inline-block bg-red-100 text-red-600 font-medium px-4 py-1 rounded-full text-sm">
              {report.reason}
            </span>
          </div>

          {/* Details */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Details</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700">
              {report.details || "No details provided"}
            </div>
          </div>

          <hr />

          {/* Post Section */}
          <div>
          <p className="text-sm font-medium text-gray-500 mb-3">
            Community Channel
          </p>

          <div className="flex items-center gap-4">
            {report.community?.image ? (
              <img
                src={report.community.image}
                alt={report.community.community_name}
                className="
                  w-16
                  h-16
                  rounded-xl
                  object-cover
                  border
                "
              />
            ) : (
              <div
                className="
                  w-16
                  h-16
                  rounded-xl
                  bg-blue-100
                  flex
                  items-center
                  justify-center
                  text-blue-600
                  font-bold
                  text-xl
                "
              >
                {report.community?.community_name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {report.community?.community_name}
              </h3>

              <p className="text-sm text-gray-500">
                Channel ID: {report.community?.id}
              </p>
            </div>
          </div>
        </div>

        </div>
      </div>

    </div>
  </div>
);
};

export default CommunityReportId;