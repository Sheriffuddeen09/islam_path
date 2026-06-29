import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import CallModal from "./CallModal";
import { toast } from "react-hot-toast";

export default function MeetingRoom({ incomingCall, setIncomingCall, callMode, setCallMode, meetingData, 
                                      activeChat, setActiveChat, setMeetingData
                                        }) {
  const { roomId } = useParams();
  const [meetingError, setMeetingError] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  

  useEffect(() => {
    loadMeeting();
  }, [roomId]);

  const loadMeeting = async () => {
  try {
    setMeetingError(null);

    const res = await api.get(`/api/meeting/${roomId}`);

    const meeting = res.data.meeting;

    if (new Date(meeting.expires_at) < new Date()) {
      setMeetingError({
        title: "Meeting Expired",
        message:
          "This meeting link has expired. Please ask the organizer to create a new meeting.",
        icon: "⏰",
      });

      return;
    }

    setMeetingData(meeting);
    setCallMode(meeting.call_type);

  } catch (err) {

    if (err.response?.status === 404) {
      setMeetingError({
        title: "Meeting Ended",
        message:
          "This meeting has been cancelled, deleted, or has already ended.",
        icon: "📴",
      });
    } else if (err.response?.status === 403) {
      setMeetingError({
        title: "Removed From Meeting",
        message:
          "You were removed from this meeting by the organizer.",
        icon: "🚫",
      });
    } else {
      setMeetingError({
        title: "Unable to Join",
        message:
          "Something went wrong while loading this meeting.",
        icon: "⚠️",
      });
    }

  } finally {
    setLoading(false);
  }
};
  if (loading) {
    return (
      <div
        className="
          h-screen
          flex
          items-center
          justify-center
        "
      >
        <span className="
                animate-spin
                h-4
                w-4
                border-2
                border-white
                border-t-transparent
                rounded-full inline-flex items-center gap-2
            " />
        Loading meeting...
      </div>
    );
  }

  if (meetingError) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">

        <div className="text-6xl mb-4">
          {meetingError.icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          {meetingError.title}
        </h2>

        <p className="text-gray-500 mt-3 leading-relaxed">
          {meetingError.message}
        </p>

        <button
          onClick={() => navigate("/")}
          className="
            mt-8
            w-full
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-3
            rounded-xl
            font-semibold
          "
        >
          Return Home
        </button>

      </div>
    </div>
  );
}

  return (
    <>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">

        <div className="text-6xl mb-4">
          {meetingError.icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-800">
          {meetingError.title}
        </h2>

        <p className="text-gray-500 mt-3 leading-relaxed">
          {meetingError.message}
        </p>

        <button
          onClick={() => navigate("/")}
          className="
            mt-8
            w-full
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-3
            rounded-xl
            font-semibold
          "
        >
          Return Home
        </button>

      </div>
    </div>
  );
    <CallModal
      activeChat={activeChat}
      callMode={callMode}
      setCallMode={setCallMode}
      incomingCall={incomingCall}
      setIncomingCall={
        setIncomingCall
      }
      meetingData={meetingData}
    />
    </>
  );
}