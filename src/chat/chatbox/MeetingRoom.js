import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import CallModal from "./CallModal";
import { toast } from "react-hot-toast";

export default function MeetingRoom({ incomingCall, setIncomingCall, callMode, setCallMode, meetingData, 
                                      activeChat, setActiveChat, setMeetingData
                                        }) {
  const { roomId } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  

  useEffect(() => {
    loadMeeting();
  }, [roomId]);

  const loadMeeting = async () => {
    try {
      const res = await api.get(
        `/api/meeting/${roomId}`
      );

      const meeting =
        res.data.meeting;

      if (
        new Date(
          meeting.expires_at
        ) < new Date()
      ) {
        toast.error(
          "Meeting link expired"
        );

        navigate("/");

        return;
      }

      setMeetingData(meeting);

      setCallMode(
        meeting.call_type
      );
    } catch (error) {
      toast.error(
        "Meeting not found"
      );

      navigate("/");
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

  if (!meetingData) {
    return null;
  }

  return (
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
  );
}