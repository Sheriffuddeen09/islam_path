import { useState } from "react";
import api from "../../Api/axios";
import { Loader2, CheckCircle2 } from "lucide-react";
import disappearingImage from '../image/disappearingImage.png'

export default function DisappearingMessagesModal({
  chat,
  onClose,
  onUpdated,
  showToast,
}) {

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  const [selected, setSelected] = useState(
    chat?.disappearing_mode || "off"
  );

  const options = [
    {
      label: "24 hours",
      value: "24h",
    },
    {
      label: "7 days",
      value: "7d",
    },
    {
      label: "90 days",
      value: "90d",
    },
    {
      label: "Off",
      value: "off",
    },
  ];

  // ✅ ONLY SAVE HERE
  const updateMode = async () => {

    try {

      setLoading(true);

      await api.post(
        `/api/chats/${chat.id}/disappearing`,
        {
          mode: selected,
        }
      );

      // ✅ callback
      onUpdated?.(selected);

      // ✅ success animation
      setSuccess(true);

      // ✅ toast
      showToast?.("Disappearing messages updated");

      // ✅ auto close
      setTimeout(() => {

        setSuccess(false);

        onClose?.();

      }, 1200);

    } catch (err) {

      console.error(err);

      showToast?.("Failed to update");

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 text-white overflow-y-auto">

      {/* HEADER */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-800">

        <button onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>

        <h1 className="text-xl font-semibold">
          Disappearing messages
        </h1>
      </div>

      {/* IMAGE */}
      <div className="flex justify-center">
        <img
          src={disappearingImage}
          alt="disappearingImage"
          className="w-32 my-6"
        />
      </div>

      {/* TEXT */}
      <div className="px-8 text-sm">

        <h2 className="text-sm font-semibold mb-4">
          Make messages in this chat disappear
        </h2>

        <p className="text-gray-200 text-xs">
          For more privacy and storage,
          new messages will disappear from this chat
          for everyone after the selected duration.
        </p>
      </div>

      {/* OPTIONS */}
      <div className="mt-2 border-b border-gray-800">

        <div className="px-6 py-5 text-sm border-b border-gray-200 mb-3">
          Message timer
        </div>

        <div className="space-y-6 px-6 pt-2 pb-10">

          {options.map((item) => {

            const active =
              selected === item.value;

            return (
              <button
                key={item.value}
                onClick={() => setSelected(item.value)}
                className="flex items-center gap-3 w-full"
              >

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    active
                      ? "border-green-500"
                      : "border-gray-500"
                  }`}
                >
                  {active && (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>

                <span className="text-sm">
                  {item.label}
                </span>

              </button>
            );
          })}
        </div>

      <div className=" float-right px-3">

        {success ? (

          <button className="bg-green-600 px-5 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Updated
          </button>

        ) : loading ? (

          <button className="bg-gray-800 px-5 py-3 rounded-xl flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Updating
          </button>

        ) : (

          <button
            onClick={updateMode}
            className="bg-green-600 hover:bg-green-700 transition px-6 py-3 rounded-xl"
          >
            Update
          </button>
        )}
      </div>
    </div>
      </div>

  );
}