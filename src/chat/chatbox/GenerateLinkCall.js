import toast from "react-hot-toast";
import api from "../../Api/axios";
import { useState } from "react";
import { Loader } from "lucide-react";

export default function GenerateLinkCall({showMeetingModal,setShowMeetingModal,
    generatedMeeting, setGeneratedMeeting, selectedExpiry, setSelectedExpiry, setForwardMessage}){

    const [creatingMeeting, setCreatingMeeting] = useState(null);

const generateMeetingLink = async (type) => {
  try {
    setCreatingMeeting(type); // 👈 IMPORTANT FIX

    let expiresAt = new Date();

    switch (selectedExpiry) {
      case "30m":
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        break;
      case "1h":
        expiresAt.setHours(expiresAt.getHours() + 1);
        break;
      case "24h":
        expiresAt.setHours(expiresAt.getHours() + 24);
        break;
      case "7d":
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
      default:
        expiresAt.setHours(expiresAt.getHours() + 1);
    }

    const res = await api.post("/api/meeting/create", {
      call_type: type,
      expires_at: expiresAt.toISOString(),
    });

    const meeting = res.data?.meeting;

    if (!meeting) {
      toast.error("Meeting creation failed");
      return;
    }

    setGeneratedMeeting(meeting);
    setShowMeetingModal(false);

    setTimeout(() => {
      setForwardMessage({
        open: true,
        type: "meeting",
        meeting,
      });
    }, 100);

    console.log("OPENING MEETING FORWARD", {
      open: true,
      type: "meeting",
      meeting,
    });
    toast.success("Meeting link generated");

  } catch (error) {
    toast.error(
      error?.response?.data?.message || "Failed to create meeting"
    );
  } finally {
    setCreatingMeeting(null); // 👈 reset
  }
};
       

       
        return (
            <>
            {
            showMeetingModal && (

        <div className="
        fixed
        inset-0
        bg-black/50
        flex
        items-center
        justify-center
        z-50
        ">

        <div className="
        bg-white
        rounded-xl
        w-96
        p-5
        relative
        ">
         <button
            disabled={creatingMeeting}
            onClick={() =>
                setShowMeetingModal(false)
            }
            className="
                mt-2
                py-2
                rounded
                disabled:opacity-50
                absolute right-4 top-0 
            "
            >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>

            </button>
        <h2 className="font-bold mb-4 text-center text-xl">
        Generate Meeting Link
        </h2>
          <label className="text-sm font-bold mb-2">Expired Time</label>
        <select
        className="
        border
        w-full
        p-2
        rounded
        mb-3
        "
        value={selectedExpiry}
        onChange={(e)=>
        setSelectedExpiry(
        e.target.value
        )}
        >

        <option value="30m">
        30 Minutes
        </option>

        <option value="1h">
        1 Hour
        </option>

        <option value="24h">
        24 Hours
        </option>

        <option value="7d">
        7 Days
        </option>

        </select>

        <div className="space-y-2">

        <label className="text-sm font-bold mb-2">Call Type</label>

        <button
            disabled={creatingMeeting !== null}
            onClick={() =>
            generateMeetingLink(
                "video"
            )
            }
            className="
            w-full
            bg-green-600
            text-white
            py-2
            rounded
            disabled:opacity-50
            disabled:cursor-not-allowed
            "
        >
            {creatingMeeting  === "video"
            ? <p className="inline-flex gap-2 items-center text-sm sm:text-lg font-bold">
                <span className="
                animate-spin
                h-4
                w-4
                border-2
                border-white
                border-t-transparent
                rounded-full inline-flex items-center gap-2
            " />
                Generating Link
                </p>
            : <p className="inline-flex gap-2 items-center text-sm sm:text-lg font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Video Meeting

            </p>}
        </button>

        <button
            disabled={creatingMeeting !== null}
            onClick={() =>
            generateMeetingLink(
                "audio"
            )
            }
            className="
            w-full
            bg-blue-600
            text-white
            py-2
            rounded
            disabled:opacity-50
            disabled:cursor-not-allowed
            "
        >
            {creatingMeeting  === "audio"
            ? <p className="inline-flex gap-2 items-center text-sm sm:text-lg font-bold">
                <span className="
                animate-spin
                h-4
                w-4
                border-2
                border-white
                border-t-transparent
                rounded-full inline-flex items-center gap-2
            " />
                Generating Link
                </p>
            : <p className="inline-flex gap-2 items-center text-sm sm:text-lg font-bold">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                Audio Meeting
            </p>}
        </button>

        </div>

           
        </div>

        </div>

        )}
            </>
            
        )
}